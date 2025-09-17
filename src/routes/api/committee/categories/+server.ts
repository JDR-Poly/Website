/** @format */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const CATEGORIES = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"].reverse(); //order should be ["2021-2022", "2022-2023"]

/**
 * Get all the years of the committee
 */
export const GET = (({}) => {
	return json({ categories: CATEGORIES });
}) satisfies RequestHandler;
