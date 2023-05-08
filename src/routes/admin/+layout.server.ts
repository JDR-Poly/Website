import { hasRolePermission, UserPermission } from '$lib/userPermissions';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw redirect(307, '/auth/login');
	}
	if (!hasRolePermission(UserPermission.MODIFY_USERS_DATA, locals.user.role)) {
		throw error(403);
	}
}) satisfies LayoutServerLoad