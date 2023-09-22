import type { RequestEvent, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit"
import { db } from "$lib/server/postgresClient";
import { sendMailValidationToken } from "$lib/server/mailClient";

export const actions = {
	/**
	 * Send another email to validate email
	 */
	default: async ({ locals, url }: RequestEvent) => {
		if (!locals.authenticated) throw error(401)
		if (locals.user?.is_email_validated) { throw error(403); }

		return db.one(`SELECT email FROM users WHERE is_email_validated=FALSE AND id=$1`, [locals.user!.id], a => a.email)
			.then((email) => {
				sendMailValidationToken(locals.user?.id!, email, url.origin)
				return { success: true }
			})
			.catch((err) => {
				return fail(500, { message: err.message })
			})
	}
} satisfies Actions;