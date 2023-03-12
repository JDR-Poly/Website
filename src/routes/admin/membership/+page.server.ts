import { sendMail } from "$lib/server/mailClient"
import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/server/memberPeriod"
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions"
import type { RequestEvent, Actions } from "./$types";
import { v4 as uuid } from "uuid"
import { error, fail, redirect } from "@sveltejs/kit"
import { readFile } from 'fs/promises';

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }: RequestEvent) {
	if (!locals.authenticated || !hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) {
		throw redirect(307, '/');
	}
}

/**
 * For a list of users, send a code for membership or add
 * period of membership for each user depending if they already have
 * an account or not
 * @param {number} request.emails list of mails
 * @param {number} request.periods the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export const actions = {
	default: async ({ request, locals }: RequestEvent) => {
		if(!locals.authenticated) throw error(401)
		if (!hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) {
			throw error(403);
		}

		const form = await request.formData();
		const emails: string[] | undefined = form.get('emails')?.toString()?.split(",")?.flatMap((v) => { return v.split(";") })
		emails?.forEach((str) => str = str.trim())
		const periodsNumber = parseInt(form.get('periodsNumber')?.toString() || "1") || 1;
		
		if (!emails) {
			return fail(400, { emails, periodsNumber })
		}
		//Query user data
		const users = await db.any("SELECT id, email, role, member_start, member_stop FROM users WHERE email IN ($[emails:csv]);", {
			emails: emails
		})

		const emailsFound = users.flatMap(element => element.email) //Temp variable only useful for finding the emails not found
		const emailsNotFound = emails.filter(element => !emailsFound.includes(element))

		//Add periods to users with account
		users.forEach(user => {
			//Prevent role change for admin
			if (user.role !== "USER" && user.role !== "MEMBER") return

			let period: Period = { start: user.member_start, stop: user.member_stop }
			for (let i = 0; i < periodsNumber; i++) {
				period = getNextPeriod(period)
			}
			updateMemberPeriod(user, period)
		})
		//Send email and code to users that don't have an account
		const errorMails = await createAndSendMemberCodes(emailsNotFound, periodsNumber)				
		return {
			success: true,
			errorMails: errorMails
		}
	}
} satisfies Actions;

/**
 * Send email and code to users that don't have an account
 * @param emails list of users' email
 * @param periodsNumber the number of periods to add
 * @returns the emails to whom a mail could not be sent
 */
async function createAndSendMemberCodes(emails: string[], periodsNumber: number): Promise<string[]> {
	const mailsError: string[] = []
	const promises: Promise<string>[] = []
	emails.forEach((email) => {
		try {
			const code = uuid()
			db.none("INSERT INTO $[table:name](validation_token, periods) VALUES($[validation_token], $[periods])", {
				table: "members_code",
				validation_token: code,
				periods: periodsNumber
			})

			const promise = ( async () => {
				let content = await readFile('static/mails/memberCode.html', { encoding: 'utf8' })
				content = content.replace('%CODE%', code)
				const res = await sendMail(email, "JDRPoly: Code de membre", content)
				if(res instanceof Error) return email
				else return ""	
			})()
			promises.push(promise)
			
		} catch (err) {			
			mailsError.push(email)
		}
	})

	const res = await (await Promise.all(promises)).filter((str) => str) 
	mailsError.push(...res)
	
	return mailsError
}
