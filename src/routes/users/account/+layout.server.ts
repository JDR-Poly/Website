/** @format */

import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	if (!locals.authenticated) {
		throw redirect(307, "/");
	} else if (!locals.user?.is_email_validated) {
		throw redirect(307, "/auth/validate-email");
	} else {
		return {
			user: locals.user!!
		}
	}
}) satisfies LayoutServerLoad;
