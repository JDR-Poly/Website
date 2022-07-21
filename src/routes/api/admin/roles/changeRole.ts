import { getUserRole, hasRolePermission } from "$lib/backend/backendPermissions"
import { db } from "$lib/backend/postgresClient"
import type { RequestEvent } from "@sveltejs/kit"

/**
 * 
 * @param {RequestEvent} request
 * @param {User} request.user 
 * @param {string} request.role 
*/
export async function post({request, locals}: RequestEvent) {
    if(!locals.authenticated) return {status: 401}
    const body = await request.json()

    const role = await getUserRole(body.user)
    if(!role) return {status: 400}
    
    if(!hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + body.role)
        || !hasRolePermission(locals.user?.role!, "GRANT_ROLE_" + role.name)) return {status: 401}

    await db.none(UPDATE_USER_ROLE, {
        table: "users",
        role: body.role,
        id: body.user.id
    })

    return {
        status: 200
    }
}  

const UPDATE_USER_ROLE = "UPDATE $[table:name] SET role = $[role] WHERE id= $[id]"