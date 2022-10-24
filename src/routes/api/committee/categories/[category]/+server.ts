import type { RequestEvent } from "./$types";
import { error, json } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";

/**
 * Get all the committees of a category
 * @type {import('./$types').RequestHandler} 
 */
export function GET({ params}: RequestEvent) {
	const category = params.category

	return db.any(
		` SELECT * FROM committee_info WHERE category = $1`,
		[category]
	)
		.then((res) => {
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}