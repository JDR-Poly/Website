/** @format */

import { error, json } from "@sveltejs/kit";
import { hasRolePermission, Role, Roles, UserPermission } from "$lib/userPermissions";
import { getUserRole } from "$lib/server/backendPermissions";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/postgresClient";
import { Period } from "$lib/publicMemberPeriod";
import { updateMemberPeriod } from "$lib/server/memberPeriod";
import { extend_membership } from "$lib/server/membership";

/**
 * See all the roles that the user can grant
 * @param {Id} url.id id of the user of whom to change role
 * @returns all the roles that the user has the permission to grant
 */
export const GET = (async ({ url, locals }) => {
	if (!locals.authenticated) throw error(401);

	const userId = parseInt(url.searchParams.get("userId") || "0") || 0;
	if (
		userId &&
		!hasRolePermission("GRANT_ROLE_" + (await getUserRole({ id: userId }))?.name, locals.user?.role)
	) {
		throw error(403);
	}

	const result: Role[] = [];
	const rolesKey = Object.keys(Roles);
	rolesKey.forEach((roleKey) => {
		if (hasRolePermission("GRANT_ROLE_" + roleKey, locals.user?.role)) {
			result.push(Roles[roleKey]);
		}
	});

	return json(result);
}) satisfies RequestHandler;

/**
 * Change the period of membership and the role of the user
 * depending of how many periods of membership are added to the user
 * @param {Id} url.userId the id of the user
 * @param {string} request.role the name of the new role
 * @param {number} request.periodsNumber the number of periods to add
 */
export const PATCH = (async ({ request, locals, url }) => {
	if (!locals.authenticated) throw error(401);

	const userId = parseInt(url.searchParams.get("userId") || "0") || 0;
	if (!userId) throw error(400, `Incorrect userId: ${userId}`);

	const body = await request.json();
	body.role = body.role.toUpperCase();
	const periodsNumber = body.periodsNumber ? body.periodsNumber : 0;

	//Check if user can change roles
	if (!hasRolePermission(`GRANT_ROLE_${body.role}`, locals.user?.role))
		throw error(403, { message: "You don't have the rights to grand this role." });
	if (body.periodsNumber > 0 && !hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role))
		throw error(403, { message: "You don't have the rights to give memberships." });

	return db
		.one("SELECT id, role, email FROM users WHERE id=$1;", [userId])
		.then(async (user) => {
			const roleModified = user.role != body.role;
			if (roleModified && !hasRolePermission(`GRANT_ROLE_${user.role}`, locals.user?.role))
				throw error(403, { message: "This user has a protected role." });

			// Update period of user
			const {member_start, member_stop} = await extend_membership(
				user.id, user.email,
				body.semesters,
				body.year
			);

			//Update role if the user just became a member
			if (roleModified) {
				db.none(`UPDATE users SET role=$1 WHERE id=$2`, [body.role, userId]);
				if (body.role != Roles.MEMBER.name)
					db.none(`UPDATE users SET member_start=NULL, member_stop=NULL WHERE id=$1`, [user.id]);
			}

			//Return new period
			return json({
				user: {
					id: user.id,
					member_start,
					member_stop,
				},
				message: "Added period to user",
			});
		})
		.catch((err) => {
			if (err.constraint && err.constraint === 'membership_pkey')
				throw error(400, "invalid overlapping member period");
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
