import { hasRolePermission, UserPermission } from '$lib/userPermissions';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from "./$types";

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }: RequestEvent) {
  if (!locals.user) {
		throw redirect(307, '/auth/login');
  }
  if (!hasRolePermission(UserPermission.MODIFY_USERS_DATA, locals.user.role)) {
    throw error(403);
  }
}