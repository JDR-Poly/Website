import { error, json } from "@sveltejs/kit";
import { hasRolePermission, Role, Roles, UserPermission } from "$lib/userPermissions";
import { getUserRole } from "$lib/server/backendPermissions";
import type { RequestEvent } from "./$types";
import { db } from "$lib/server/postgresClient";
import { getNextPeriod, type Period } from "$lib/publicMemberPeriod";
import { updateMemberPeriod } from "$lib/server/memberPeriod";


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
	if (id && !hasRolePermission("GRANT_ROLE_" + (await getUserRole({ id }))?.name, locals.user?.role)) {
		throw error(403)
	}

	const result: Role[] = []
	const rolesKey = Object.keys(Roles)
	rolesKey.forEach(roleKey => {
		if (hasRolePermission("GRANT_ROLE_" + roleKey, locals.user?.role)) {
			result.push(Roles[roleKey])
		}
	});

	return json(result)
}

/**
 * Change the period of membership and the role of the user
 * depending of how many periods of membership are added to the user
 * @type {import('./$types').RequestHandler}
 * @param {Id} request.id the id of the user
 * @param {string} request.role the name of the new role
 * @param {number} request.periodsNumber the number of periods to add
 */
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const body = await request.json()
	const periodsNumber = body.periodsNumber ? body.periodsNumber : 0
	
	if (body.periodsNumber > 0 && !hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) throw error(403)
	

	return db.one("SELECT id, role, member_start, member_stop FROM users WHERE id=$1;",
		[body.id]
	)
	.then((user) => {
		const roleModified = user.role != body.role 
		if(roleModified && !hasRolePermission("GRANT_ROLE_" + body.role, locals.user?.role)) throw error(403)

		const canRoleBeMember = body.role == Roles.USER.name || body.role == Roles.MEMBER.name

		let period: Period = { start: canRoleBeMember ? user.member_start : undefined, stop: canRoleBeMember ? user.member_stop : undefined }
		if(body.periodsNumber > 0 && canRoleBeMember) {
			//Add periods
			for (let i = 0; i < periodsNumber; i++) {
				period = getNextPeriod(period)
			}
			updateMemberPeriod({ id: body.id }, period)
		}

		if(roleModified) {
			db.none(`UPDATE users SET role=$1, member_start=$2, member_stop=$3 WHERE id=$4`, [body.role, period.start, period.stop, body.id])
		}
		
		//Return new period
		return json({
			user: {
				id: body.id,
				member_start: period.start,
				member_stop: period.stop
			},
			message: "Added period to user"
		})
	})
	.catch((err) => {
		throw error(500, err.message)
	})
}