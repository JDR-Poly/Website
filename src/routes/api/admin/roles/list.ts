import type { RequestEvent } from "@sveltejs/kit";
import { Role, Roles } from "$lib/userPermissions";
import { getUserRole, hasRolePermission } from "$lib/backend/backendPermissions";

/**
 * See all the roles that the user can grant
 * @param {RequestEvent} request 
 * @param {number} request.id id of the user of whom to change role
 * @returns all the roles that the user has the permission to grant
 */
export async function post({ request, locals }: RequestEvent) {
	if (!locals.authenticated) return { status: 401 }
	const body = await request.json()
	if (body.id && !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + (await getUserRole({ id: body.id }))?.name)) {
		return { status: 401 }
	}

	const result: Role[] = []
	const rolesKey = Object.keys(Roles)
	rolesKey.forEach(roleKey => {
		if (hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + roleKey)) {
			result.push(Roles[roleKey])
		}
	});

	return {
		status: 200,
		body: {
			roles: (result as any)
		}
	}
}