/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, isRoleMember, Roles, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { v4 as uuid } from "uuid";
import { Period, periodFromYearSemesters } from "$lib/publicMemberPeriod";
import { updateMemberPeriod } from "$lib/server/memberPeriod";

/**
 * Get all membership codes
 * @return {MembershipCode[]} list of membership codes
 */
export const GET = (async ({ locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.ADMIN_PANEL, locals.user?.role)) throw error(403);

	return db
		.any(`SELECT id, email, period AS semesters, year, email_sent FROM membership_code ORDER BY email_sent DESC;`)
		.then((result) => {
			return json(result);
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Create a new membership code
 *
 * @param {string} email the email to send the code to
 * @param {string} semesters the membership semesters ('autumn', 'spring', 'all')
 * @param {number} year the membership year
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) throw error(403);

	const data = await request.json();

	if (!data.email || !data.semesters || !data.year) {
		throw error(400, "Missing required fields: email, semesters, year");
	}

	if (!["autumn", "spring", "all"].includes(data.semesters)) {
		throw error(400, "semesters must be 'autumn', 'spring', or 'all'");
	}
	data.year = Number(data.year);

	const userResult = await db.any(
        "SELECT id, email, role, member_start, member_stop FROM users WHERE email = $[email];",
        { email: data.email },
    ).then(
		(res) => res.map((user) => {user.role = Roles[user.role]; return user})
	);
	if (userResult && userResult.length > 0) {
		const user = userResult[0];

		let new_period = periodFromYearSemesters(data.year, data.semesters);
		if (user.member_start && user.member_stop) {
			const old_period = new Period(user.member_start, user.member_stop);
			if (new_period.overlaps(old_period))
				new_period = new_period.combineWith(old_period);
			else {
				throw error(400, "New membership period must overlap with existing one");
			}
		}

		
		updateMemberPeriod(user, new_period);
		return new Response();
	}

	// Generate a random validation token
	const validation_token = uuid();

	// TODO send mail for code

	return db
		.one(
			`INSERT INTO membership_code (validation_token, email, period, year, email_sent)
			VALUES ($[validation_token], $[email], $[semesters], $[year], CURRENT_TIMESTAMP)
			RETURNING id, email_sent;`,
			{ validation_token, email: data.email, semesters: data.semesters, year: data.year },
		)
		.then((res) => {
			return json(res, { status: 201 });
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
