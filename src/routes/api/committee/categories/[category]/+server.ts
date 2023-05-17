import { error, json } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";
import type { RequestHandler } from "./$types";
import { logger } from '$lib/server/logger';

/**
 * Get all the committees of a category
 */
export const GET = (async ({ params }) => {
	const category = params.category

	return db.any(
		` SELECT * FROM committee_info WHERE category = $1`,
		[category]
	)
		.then((res) => {
			res.forEach((v) => {
				if (v.image) v.imageb64 = Buffer.from(v.image).toString("base64") //Convert to b64
				v.image = undefined
			})
			return res
		})
		.then((res) => {
			return json(res)
		})
		.catch((err) => {
			logger.error(err);
			throw error(500, err.message)
		})
}) satisfies RequestHandler