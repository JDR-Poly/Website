/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import crypto from "crypto";

/**
 * Get all membership codes
 * @return {MembershipCode[]} list of membership codes
 */
export const GET = (async ({ locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.ADMIN_PANEL, locals.user?.role)) throw error(403);

	return db
		.any(`SELECT validation_token, email, period, year, email_sent FROM membership_code ORDER BY email_sent DESC;`)
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
 * @param {string} period the membership period ('autumn', 'spring', 'all')
 * @param {number} year the membership year
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.ADMIN_PANEL, locals.user?.role)) throw error(403);

	const data = await request.json();

	if (!data.email || !data.period || !data.year) {
		throw error(400, "Missing required fields: email, period, year");
	}

	if (!["autumn", "spring", "all"].includes(data.period)) {
		throw error(400, "period must be 'autumn', 'spring', or 'all'");
	}

	// Generate a random validation token
	const validation_token = crypto.randomBytes(32).toString("hex");

	return db
		.one(
			`INSERT INTO membership_code (validation_token, email, period, year, email_sent)
			VALUES ($[validation_token], $[email], $[period], $[year], CURRENT_DATE)
			RETURNING validation_token;`,
			{ validation_token, email: data.email, period: data.period, year: data.year },
			(a) => a.validation_token,
		)
		.then((token) => {
			return json({ validation_token: token });
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
