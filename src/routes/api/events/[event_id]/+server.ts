import { db } from "$lib/server/postgresClient";
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions";
import { __envDir, getByteArrayFromBase64 } from "$lib/utils";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/server/logger";

/** 
 * Get a specific event
 */
export const GET = (async ({ params }) => {
	const id = params.event_id
	return db.one(
		` SELECT * FROM events
            WHERE id = $1
        `,
		[id]
	).then((res) => {
		if (res.image) res.imageb64 = Buffer.from(res.image).toString("base64") //Convert to b64
		res.image = undefined
		return res
	})
		.then((res) => {
			return json(res)
		}).catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler

/** 
 * Delete an event
 */
export const DELETE = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401)

	const id = params.event_id
	const canDelete = db.one(
		` SELECT author FROM events
            WHERE id = $1
        `,
		[id],
		a => a.author
	).then((author) => {
		if (!hasRolePermission(UserPermission.MODIFY_EVENT, locals.user?.role) && locals.user?.id?.toString() !== author) return false
	}).catch((err) => {
		throw error(500, err.message)
	})

	if (!canDelete) throw error(403)

	return db.none(
		` DELETE FROM events
            WHERE id = $1
        `,
		[id]
	).then(() => {
		db.none(
			` DELETE FROM event_inscription
				WHERE event_id = $1`
			, [id]
		)
		return new Response
	}).catch((err) => {
		throw error(500, err.message)
	})
}) satisfies RequestHandler


/** 
 * @param {string} title the title of the event
 * @param {string} category the category of the event
 * @param {string} description the description of the event
 * @param {string} date the UTCdate of the event
 * @param {string} image the base64 string of the image of the event
 * @param {string} inscription the string of a boolean, indicating if people can join the event
 * @param {string} inscription_group name of the group that are allowed to join
 * @param {number?} inscription_limit limit of people that can subscribe to this event
 * @param {string} inscription_start the UTCdate of when people can join an event
 * @param {string} inscription_stop the UTCdate of when people can no longer join an event
 */
export const PATCH = (async ({ params, request, locals }) => {		
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.MODIFY_EVENT, locals.user?.role)) throw error(403)

	const id = params.event_id
	const data = await request.json()
	if(data.image) data.image = getByteArrayFromBase64(data.image)
	if (data.inscription_group !== Roles.USER.name && data.inscription_group !== Roles.MEMBER.name && data.inscription_group !== Roles.COMMITTEE.name) throw error(400, "inscription_group is not valid, should be either user, member or committee")
	
	return db.one(
		`UPDATE events SET
			title=$[title], category=$[category],
			description=$[description],date=$[date],
			inscription=$[inscription], inscription_group=$[inscription_group],
			inscription_limit=$[inscription_limit], image=COALESCE($[image], image),
			inscription_start=$[inscription_start],inscription_stop=$[inscription_stop]
		WHERE id=$[id]
		RETURNING *;`,
		{ id: id, ...data, image: data.image  }
	)
		.then(async (res) => {
			if (!data.inscription) {
				db.none(
					` DELETE FROM event_inscription
						WHERE event_id = $1`
					, [id]
				)
			}
			return json(res)
		})
		.catch((err) => {
			logger.error(err.message);
			throw error(500, err.message)
		})
}) satisfies RequestHandler