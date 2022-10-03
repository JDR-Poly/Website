import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }: RequestEvent) {
	if (!locals.authenticated || !hasRolePermission(UserPermission.CREATE_EVENT, locals.user?.role)) {
	  throw redirect(307, '/events');
	}
}
