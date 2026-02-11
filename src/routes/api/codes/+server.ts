/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { v4 as uuid } from "uuid";
import { AlreadyMemberError, extend_membership, send_membership_code, send_or_extend_membership } from "$lib/server/membership";

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

	return await send_or_extend_membership(
		data.email, data.semesters, data.year
	)
		.then((res) => {
			if ('period' in res)
				return json(res.period, {status: 200});
			else
				return json(res.code, {status: 201});
		})
		.catch((err) => {
			switch (err.constructor) {
				case AlreadyMemberError:
					throw error(409, "Ce mail est déjà membre");
				default:
					throw error(500);
			}
		});
}) satisfies RequestHandler;
