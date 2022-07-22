import type { RequestEvent } from "@sveltejs/kit";
import { Role, Roles } from "$lib/userPermissions";
import { getUserRole, hasRolePermission } from "$lib/backend/backendPermissions";
import { db } from "$lib/backend/postgresClient";

/**
 * See all the roles that the user can grant
 * @param {RequestEvent} request 
 * @param {number} request.id id of the user of whom to change role
 * @returns all the roles that the user has the permission to grant
 */
export async function get({ url, locals }: RequestEvent) {
	if (!locals.authenticated) return { status: 401 }
	const id = parseInt(url.searchParams.get("id") || "0") || 0
	
	if (id && !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + (await getUserRole({id}))?.name)) {
		return { status: 403 }
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

/**
 * Modify the role of a user
 * @param {RequestEvent} request
 * @param {number} request.id the id of the user whom role will be changed 
 * @param {string} request.roleName the new role name
*/
export async function post({ request, locals }: RequestEvent) {
	if (!locals.authenticated) return { status: 401 }
	const body = await request.json()

	const role = await getUserRole({id: body.id})
	if (!role) return { status: 400 }

	if (!hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + body.roleName)
		|| !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + role.name)) return { status: 403 }

	await db.none("UPDATE $[table:name] SET role = $[role], member_start=NULL, member_stop=NULL WHERE id=$[id]", {
		table: "users",
		role: body.roleName,
		id: body.id
	})

	return {
		status: 200
	}
}