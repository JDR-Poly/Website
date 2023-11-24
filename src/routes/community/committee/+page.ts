/** @format */

import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
	return {
		categories: fetch("/api/committee/categories").then(async (res) => {
			const body = await res.json();
			if (!res.ok) throw error(res.status, body.message);
			return body.categories as string[];
		}),
	};
}) satisfies PageLoad;
