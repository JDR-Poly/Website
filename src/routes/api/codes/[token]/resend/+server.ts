/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Resend a membership code email
 * Updates the email_sent date to current date
 *
 * Note: Actual email sending logic to be implemented later
 *
 * @param {string} token the validation token of the code to resend
 */
export const POST = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.ADMIN_PANEL, locals.user?.role)) throw error(403);

	const { token } = params;

	if (!token) {
		throw error(400, "Missing token parameter");
	}

	return db
		.one(
			`UPDATE membership_code
			SET email_sent = CURRENT_DATE
			WHERE validation_token = $[token]
			RETURNING validation_token, email, period, year, email_sent;`,
			{ token },
		)
		.then((result) => {
			// TODO: Implement actual email sending logic here
			// For now, just update the date and return success
			return json({
				success: true,
				message: "Code resend triggered (email logic not yet implemented)",
				code: result
			});
		})
		.catch((err) => {
			if (err.name === "QueryResultError") {
				throw error(404, "Code not found");
			}
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
