/** @format */

import { db } from "$lib/server/postgresClient";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { hasRolePermission, isRoleMember, Roles, UserPermission } from "$lib/userPermissions";
import type { Id } from "$gtypes";

interface UserInformationForBot {
	userId: Id;
	member: boolean;
	email: string;
	discordId: string;
	memberUntil: Date;
}

/**
 * Allow bot user to get user data for discord
 * @param {Id} request.id id of the user to looks for
 * @param {string} url.email email of the user to looks for
 * @param {string} url.discordId discord id of the user to looks for
 * @returns {UserInformationForBot} all information needed for the discord bot
 */
export const GET = (async ({ locals, url }) => {
	if (!locals.authenticated) throw error(401);
	if (
		!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role) ||
		!hasRolePermission(UserPermission.MODIFY_USER_DISCORD, locals.user?.role)
	)
		throw error(403);

	const id = parseInt(url.searchParams.get("userId") || "null") || null;
	const email = url.searchParams.get("email");
	const discordId = url.searchParams.get("discordId");

	//Search based on the parameter given, default to id
	const sqlMatcher = discordId ? ["discord_id", discordId] : email ? ["email", email] : ["id", id];

	return db
		.one(`SELECT id, email, role, member_stop, discord_id FROM users_memberships_view WHERE $1~ = $2`, sqlMatcher)
		.then((res) => {
			let isMember = isRoleMember(Roles[res.role]);
			let data: UserInformationForBot = {
				userId: res.id,
				member: isMember,
				email: res.email,
				discordId: res.discord_id,
				memberUntil: isMember ? res.member_stop : undefined,
			};
			return json(data);
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Allow bot to modify the discordId of a user
 * @param {Id} url.userId id of user to modify
 * @param {string | null} request.discordId the new discordId to set (null resets it)
 */
export const PATCH = (async ({ locals, request, url }) => {
	if (!locals.authenticated) throw error(401);
	if (
		!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role) ||
		!hasRolePermission(UserPermission.MODIFY_USER_DISCORD, locals.user?.role)
	)
		throw error(403);
	const body = await request.json();
	const userId = parseInt(url.searchParams.get("userId") || "null") || null;

	if (!userId) throw error(400, { message: `userId ${userId} is not a valid userId` });

	return db
		.none(`UPDATE users SET discord_id=$1 WHERE id=$2`, [body.discordId, userId])
		.then(() => new Response())
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
