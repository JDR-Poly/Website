import type { RequestEvent } from "./$types";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }: RequestEvent) {
	if (!locals.authenticated) {
		throw redirect(307, '/');
	} else if(!locals.user?.is_email_validated) {
		throw redirect(307, '/auth/validate-email');
	}
}