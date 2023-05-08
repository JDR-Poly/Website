import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

//This file handle admin force put/delete of users from event

/**
 * Force remove a user from the list of subscribed 
* @param {number} request.user_id the id of the user to remove 
 */
export const DELETE = (async ({ params, request, locals }) => {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, locals.user?.role)) throw error(403)

	const event_id = params.event_id

	const body = await request.json()
	const user_id = body.user_id

	return db.none(
		` DELETE FROM event_inscription
            WHERE user_id = $1 AND event_id = $2
        `,
		[user_id, event_id]
	)
		.then(() => {
			console.info(`{id:${locals.user!.id},name:${locals.user!.name}} force removed user {id:${user_id}} from event {id:${event_id}}`);
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler

/** 
 * Force the add of an user to the list of subscribed users of the event
 * @param {number} request.user_id the id of the user to add 
 */
export const POST = (async ({ params, request, locals }) => {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.SUBSCRIBE_USER_TO_EVENT, locals.user?.role)) throw error(403)

	const event_id = params.event_id

	const body = await request.json()
	const user_id = body.user_id
	return db.none(
		`INSERT into event_inscription(user_id, event_id)
		VALUES ($1,$2)
		`,
		[user_id, event_id]
	)
		.then(() => {
			console.info(`{id:${locals.user!.id},name:${locals.user!.name}} force subscribed user {id:${user_id}} into event {id:${event_id}}`);
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler