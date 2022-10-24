import type { RequestEvent } from "./$types";
import { json } from '@sveltejs/kit';

const CATEGORIES = ["2022-2023", "2021-2022"]

/**
 * Get all the years of the committee
 * @type {import('./$types').RequestHandler} 
 */
export function GET({ }: RequestEvent) {
	return json({categories: CATEGORIES})
}