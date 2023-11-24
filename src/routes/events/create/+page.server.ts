/** @format */

import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

/** @type {import('./$types').PageServerLoad} */
export const load = (({ locals }) => {
	if (!hasRolePermission(UserPermission.CREATE_EVENT, locals.user?.role)) {
		throw redirect(307, "/events");
	}
}) satisfies PageServerLoad;
