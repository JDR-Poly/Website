import { error, json } from "@sveltejs/kit";
import { hasRolePermission, Role, Roles, UserPermission } from "$lib/userPermissions";
import { getUserRole } from "$lib/server/backendPermissions";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/postgresClient";
import { Period } from "$lib/publicMemberPeriod";
import { updateMemberPeriod } from "$lib/server/memberPeriod";


/**
 * See all the roles that the user can grant
 * @param {Id} request.id id of the user of whom to change role
 * @returns all the roles that the user has the permission to grant
 */
export const GET = (async ({ url, locals }) => {
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
}) satisfies RequestHandler

/**
 * Change the period of membership and the role of the user
 * depending of how many periods of membership are added to the user
 * @param {Id} request.id the id of the user
 * @param {string} request.role the name of the new role
 * @param {number} request.periodsNumber the number of periods to add
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401)

	const body = await request.json()
	body.role = body.role.toUpperCase()
	const periodsNumber = body.periodsNumber ? body.periodsNumber : 0

	//Check if user can change roles
	if (!hasRolePermission(`GRANT_ROLE_${body.role}`, locals.user?.role)) throw error(403, { message: "You don't have the rights to grand this role." })
	if (body.periodsNumber > 0 && !hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role)) throw error(403, { message: "You don't have the rights to give memberships." })

	return db.one("SELECT id, role, member_start, member_stop, email FROM users WHERE id=$1;",
		[body.id]
	)
		.then((user) => {
			const roleModified = user.role != body.role
			if (roleModified && !hasRolePermission(`GRANT_ROLE_${user.role}`, locals.user?.role)) throw error(403, { message: "This user has a protected role." })
			let period = null
			if(body.periodsNumber > 0) {
				period = new Period(user.member_start, user.member_stop)
				period.addSemesters(periodsNumber)
				updateMemberPeriod({ id: body.id, email: user.email, role: Roles[body.role] }, period)
			}

			if (roleModified) {
				db.none(`UPDATE users SET role=$1 WHERE id=$2`, [body.role, body.id])
				if(body.role != Roles.MEMBER.name) db.none(`UPDATE users SET member_start=NULL, member_stop=NULL WHERE id=$1`, [body.id])
			}

			//Return new period
			return json({
				user: {
					id: body.id,
					member_start: period ? period.start : null,
					member_stop: period ? period.stop : null
				},
				message: "Added period to user"
			})
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler