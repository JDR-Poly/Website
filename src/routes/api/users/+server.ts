import { error, json } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions";
import type { RequestEvent } from "./$types";

/** @type {import('./$types').RequestHandler} */
export function GET({ locals }: RequestEvent) {
	if(!locals.authenticated) throw error(401)
	if(!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role)) throw error(403)

	const mailSQLText = locals.authenticated && hasRolePermission(UserPermission.SEE_MAIL, locals.user?.role) ? "email, " : "" 
	return db.any(
		` SELECT 
			id, ${mailSQLText}name, role, account_creation, discord_id, bio, member_start, member_stop 
			FROM users`
	)
		.then((res) => {
			return json(res.map(v => {
				v.role = Roles[v.role]
				return v
			}))
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}