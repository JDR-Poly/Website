import { db } from "$lib/server/postgresClient";
import type { RequestEvent } from "./$types";
import { error, json } from '@sveltejs/kit';
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions";

/** @type {import('./$types').RequestHandler} */
export function GET({ params, locals }: RequestEvent) {
	const id = params.id
	const mailSQLText = locals.authenticated && hasRolePermission(UserPermission.SEE_MAIL, locals.user?.role) ? "email, " : "" 

	return db.one(
		` SELECT 
			id, ${mailSQLText}name, role, account_creation, discord_id, bio, member_start, member_stop 
			FROM users WHERE id = $1`,
		[id]
	)
		.then((res) => {
			res.role = Roles[res.role]
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}
