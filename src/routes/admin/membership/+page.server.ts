/** @format */

import { sendMail } from "$lib/server/mailClient";
import { updateMemberPeriod } from "$lib/server/memberPeriod";
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions";
import type { Actions, PageServerLoad } from "./$types";
import { v4 as uuid } from "uuid";
import { error, fail, redirect } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import { Period } from "$lib/publicMemberPeriod";
import { __envDir } from "$lib/utils";

export const load = (async ({ locals }) => {
	if (!locals.authenticated || !hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) {
		throw redirect(307, "/");
	}
}) satisfies PageServerLoad;

/**
 * For a list of users, send a code for membership or add
 * period of membership for each user depending if they already have
 * an account or not
 * @param {number} request.emails list of mails
 * @param {number} request.periods the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.authenticated) throw error(401);
		if (!hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) {
			throw error(403);
		}

		const form = await request.formData();
		const periodsNumber = parseInt(form.get("periodsNumber")?.toString() || "1") || 1;

		//Parse emails
		let emails: string[] | undefined = form
			.get("emails")
			?.toString()
			?.split(",")
			?.flatMap((v) => {
				return v.split(";");
			});
		emails = emails?.map((str) => str.trim().toLowerCase());

		if (!emails) {
			return fail(400, { emails, periodsNumber });
		}
		//Query user data
		const users = await db.any(
			"SELECT id, email, role, member_start, member_stop FROM users WHERE email IN ($[emails:csv]);",
			{
				emails: emails,
			},
		);

		const emailsFound = users.flatMap((element) => element.email.toLowerCase()); //Temp variable only useful for finding the emails not found
		const emailsNotFound = emails.filter((element) => !emailsFound.includes(element));

		//Add periods to users with account
		users.forEach((user) => {
			let period = new Period(user.member_start, user.member_stop);
			period.addSemesters(periodsNumber);

			user.role = Roles[user.role];
			updateMemberPeriod(user, period);
		});
		//Send email and code to users that don't have an account
		const errorMails = await createAndSendMemberCodes(emailsNotFound, periodsNumber);
		return {
			success: true,
			errorMails: errorMails,
		};
	},
} satisfies Actions;

/**
 * Send email and code to users that don't have an account
 * @param emails list of users' email
 * @param periodsNumber the number of periods to add
 * @returns the emails to whom a mail could not be sent
 */
async function createAndSendMemberCodes(emails: string[], periodsNumber: number): Promise<string[]> {
	const mailsError: string[] = [];
	const promises: Promise<string>[] = [];
	let mailContent = await readFile(__envDir + "mails/memberCode.html", { encoding: "utf8" });
	emails.forEach((email) => {
		try {
			const code = uuid();

			db.none(
				"INSERT INTO members_code(validation_token, periods) VALUES($[validation_token], $[periods])",
				{
					validation_token: code,
					periods: periodsNumber,
				},
			);

			const promise = (async () => {
				let userContent = mailContent.replace("%CODE%", code);
				const res = await sendMail(email, "JDRPoly: Code de membre", userContent);
				if (res instanceof Error) return email;
				else return "";
			})();
			promises.push(promise);
		} catch (err) {
			mailsError.push(email);
		}
	});

	const res = await (await Promise.all(promises)).filter((str) => str);
	mailsError.push(...res);

	return mailsError;
}
