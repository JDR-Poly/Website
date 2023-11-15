import { db } from "$lib/server/postgresClient";
import type { RequestHandler } from "./$types";
import { error, json } from '@sveltejs/kit';
import { hasRolePermission, isRoleMember, Roles, UserPermission } from "$lib/userPermissions";

export const GET = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401)
	const email = params.email	
	
	if (!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role) || !hasRolePermission(UserPermission.MODIFY_USER_DISCORD, locals.user?.role)) throw error(403)

	return db.one(
		` SELECT 
			id, email, role, member_stop, discord_id 
			FROM users WHERE email = $1`,
		[email]
	)
		.then((res) => {
			let isMember = isRoleMember(Roles[res.role])
			let data = {
				user_id: res.id,
				member: isMember,
				email: res.email,
				discord_id: res.discord_id,
				member_until: isMember ? res.member_stop : undefined,
			}
			return json(data)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler