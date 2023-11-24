/** @format */

import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
	if (locals.authenticated && locals.user?.is_email_validated) {
		throw redirect(307, "/");
	}
}) satisfies LayoutServerLoad;
