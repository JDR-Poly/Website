import { db } from "$lib/server/postgresClient";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: RequestEvent) {
	const body = await request.json()

	return db.one(`SELECT id FROM email_validation WHERE validation_token=$1`, [body.uuid], a => a.id)
		.then((id) => {
			return db.none("UPDATE users SET is_email_validated=TRUE WHERE id=$1", 
				[id]
			)
				.then((res) => {
					db.none("DELETE FROM email_validation WHERE id=$1",[id])
					return new Response("Email validated by token verification")
				})
			
		})
		.catch((err) => {
			if((err as Error)?.message === "No data returned from the query.")
				throw error(404, "Invalid token")
			throw err
		})
}