import { error, json } from "@sveltejs/kit";
import { Role, Roles } from "$lib/userPermissions";
import { getUserRole, hasRolePermission } from "$lib/server/backendPermissions";
import type { RequestEvent } from "./$types";
import { db } from "$lib/server/postgresClient";


/**
 * See all the roles that the user can grant
 * @type {import('./$types').RequestHandler}
 * @param {RequestEvent} request 
 * @param {Id} request.id id of the user of whom to change role
 * @returns all the roles that the user has the permission to grant
 */
export async function GET({ url, locals}: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	
	const id = parseInt(url.searchParams.get("id") || "0") || 0
	if (id && !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + (await getUserRole({ id }))?.name)) {
		throw error(403)
	}

	const result: Role[] = []
	const rolesKey = Object.keys(Roles)
	rolesKey.forEach(roleKey => {
		if (hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + roleKey)) {
			result.push(Roles[roleKey])
		}
	});

	return json(result)
}

/**
 * Modify the role of a user
 * @type {import('./$types').RequestHandler}
 * @param {RequestEvent} request
 * @param {Id} request.id the id of the user whom role will be changed 
 * @param {string} request.roleName the new role name
*/
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	const body = await request.json()
	const roleOfModifiedUser = await getUserRole({ id: body.id })
	if (!roleOfModifiedUser) throw error(400, "User id is invalid")

	if (!hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + body.roleName)
		|| !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + roleOfModifiedUser.name))
		throw error(403, "User doesn't have the permission to do that")

	return db.none("UPDATE users SET role = $1, member_start=NULL, member_stop=NULL WHERE id=$2",
		[body.roleName, body.id]
	)
	.then(() => {return new Response()})
	.catch((err) => {throw error(500, err.message)})
}