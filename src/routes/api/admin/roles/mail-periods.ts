import { hasRolePermission } from "$lib/backend/backendPermissions"
import { sendMail } from "$lib/backend/mailClient"
import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/backend/memberPeriod"
import { db } from "$lib/backend/postgresClient"
import { UserPermission } from "$lib/userPermissions"
import type { RequestEvent } from "@sveltejs/kit"
import { v4 as uuid } from "uuid"

/**
 * For a list of users, send a code for membership or add
 * period of membership for each user depending if they already have
 * an account or not
 * @param {number} request.emails list of mails
 * @param {number} request.periods the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export async function post({ request, locals }: RequestEvent) {
	if (!locals.authenticated) return { status: 401 }
	if (!hasRolePermission(locals.user?.role!, UserPermission.GRANT_ROLE_MEMBER)) return { status: 403 }

	const body = await request.json()
	const periodsNumber = parseInt(body.periods || "1")

	//Query user data
	const users = await db.any("SELECT id, email, role, member_start, member_stop FROM $[table:name] WHERE email IN ($[emails:csv]);", {
		table: "users",
		emails: body.emails
	})

	const emailsFound = users.flatMap(element => element.email) //Temp variable only useful for finding the emails not found
	const emailsNotFound = (body.emails as string[]).filter(element => !emailsFound.includes(element))
	
	//Add periods to users with account
	users.forEach(user => {
		let period: Period = { start: user.member_start, stop: user.member_stop }
		for (let i = 0; i < periodsNumber; i++) {
			period = getNextPeriod(period)
		}
		updateMemberPeriod(user, period)
	})

	//Send email and code to users that don't have an account
	const errorMails = await createAndSendMemberCodes(emailsNotFound, periodsNumber)

	return {
		status: 200,
		body: {
			errorMails: errorMails
		}
	}
}

/**
 * Send email and code to users that don't have an account
 * @param emails list of users' email
 * @param periodsNumber the number of periods to add
 * @returns the emails to whom a mail could not be sent
 */
async function createAndSendMemberCodes(emails: string[], periodsNumber: number): Promise<string[]> {
	const mailsError: string[] = []
	emails.forEach(email => {
		try {
			const code = uuid()
			db.none("INSERT INTO $[table:name](validation_token, periods) VALUES($[validation_token], $[periods])", {
				table: "members_code",
				validation_token: code,
				periods: periodsNumber
			})
			sendMail(email, "JDRPoly: Code de membre", "<p>" + code + "</p>")
		} catch (err) {
			mailsError.push(email)
		}
	})
	return mailsError
}

