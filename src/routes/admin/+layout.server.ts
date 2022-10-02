import { UserPermission } from '$lib/userPermissions';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from "./$types";

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }: RequestEvent) {
  if (!locals.user) {
		throw redirect(307, '/auth/login');
  }
  if (!locals.user.role?.permissions.has(UserPermission.MODIFY_USERS_DATA)) {
    throw error(403);
  }
}