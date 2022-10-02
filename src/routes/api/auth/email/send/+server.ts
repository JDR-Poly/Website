import { sendMailValidationToken } from "$lib/server/mailClient"
import { db } from "$lib/server/postgresClient"
import { error } from "@sveltejs/kit"
import type { RequestEvent } from "./$types";

/** 
 * Send a validation email
 * @type {import('./$types').RequestHandler} 
 */
export async function POST({ request, url }: RequestEvent) {
	const body = await request.json()
	return db.one(
		`SELECT email FROM users 
		WHERE is_email_validated=FALSE AND id=$1`, [body.id], a => a.email
		)
		.then((email) => {
			sendMailValidationToken(body.id, email, url.origin)
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}