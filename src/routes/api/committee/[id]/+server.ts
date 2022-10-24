import type { RequestEvent } from "./$types";
import { error } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";

/**
 * Delete a committee from the committee page
 * @type {import('./$types').RequestHandler} 
 */
export function DELETE({ params}: RequestEvent) {
	const committee_id = params.id

	return db.none(
		`DELETE FROM committee_info WHERE id = $1`,
		[committee_id]
	)
		.then(() => {
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}