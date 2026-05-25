/** @format */

import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { frozenAccounts } from "$lib/evenementsUtils";

export const load = (async ({ locals }) => {
	if (!locals.authenticated) {
		throw redirect(307, "/");
	} else if (!locals.user?.is_email_validated) {
		throw redirect(307, "/auth/validate-email");
	} else {
		if (frozenAccounts.includes(locals.user?.id || -1)){
			throw error(403, "account frozen! cannot modify data");
		}
		return {
			user: locals.user!!,
		};
	}
}) satisfies LayoutServerLoad;
