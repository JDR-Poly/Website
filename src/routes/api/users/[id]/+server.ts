/** @format */

import { db } from "$lib/server/postgresClient";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions";

export const GET = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401);
	const id = params.id;

	if (
		parseInt(id) != locals.user?.id &&
		!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role)
	)
		throw error(403);
	const mailSQLText =
		locals.authenticated && hasRolePermission(UserPermission.SEE_MAIL, locals.user?.role)
			? "email, "
			: "";
	const discordSQLText =
		locals.authenticated && (
			hasRolePermission(UserPermission.SEE_USER_DISCORD, locals.user?.role)
			|| locals.user?.id === Number(id)
		)
			? "discord_id, discord_username, "
			: "";

	return db
		.one(
			` SELECT 
			id, ${mailSQLText}name, role, account_creation, ${discordSQLText}member_start, member_stop
			FROM users_memberships_view WHERE id = $1`,
			[id],
		)
		.then((res) => {
			res.role = Roles[res.role];
			return json(res);
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
