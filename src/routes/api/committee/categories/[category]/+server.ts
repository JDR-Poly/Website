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
			res.forEach((v) => {
				if(v.image) v.imageb64 = Buffer.from(v.image).toString("base64") //Convert to b64
				v.image = undefined
			})	
			return res	
		})
		.then((res) => {			
			return json(res)
		})
		.catch((err) => {	
			console.error(err);
					
			throw error(500, err.message)
		})
}