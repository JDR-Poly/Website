/** @format */

import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { send_membership_code } from "$lib/server/membership";

/**
 * Resend a membership code email
 * Updates the email_sent date to current date
 *
 * @param {string} id the public id associated to a validation token
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) throw error(403);

	const data = await request.json();
	const id: number = data.id;

	if (!id) {
		throw error(400, "Missing id parameter");
	}

	return db
		.one(
			`UPDATE membership_code
			SET email_sent = CURRENT_TIMESTAMP
			WHERE id = $[id]
			RETURNING validation_token, email, email_sent;`,
			{ id },
		)
		.then(({validation_token, email, email_sent}) => {
			send_membership_code(email, validation_token)

			return json({
				email_sent: email_sent
			});
		})
		.catch((err) => {
			if (err.name === "QueryResultError") {
				throw error(404, "Code not found");
			}
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
