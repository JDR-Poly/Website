/** @format */

import type { RequestEvent } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }: RequestEvent) {
	return {
		authenticated: locals.authenticated,
		user: locals.user,
	};
}
