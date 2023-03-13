import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { __envDir } from "$lib/utils";
import { error, json } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import type { RequestEvent } from "./$types";

/**  ---Event GET---  */

/** 
 * @type {import('./$types').RequestHandler} 
 */
export function GET({ params }: RequestEvent) {
	const id = params.event_id
	return db.one(
		` SELECT * FROM events
            WHERE id = $1
        `,
		[id]
	).then((res) => {
		if(res.image) res.imageb64 = Buffer.from(res.image).toString("base64") //Convert to b64
		res.image = undefined
	})
	.then((res) => {
		return json(res)
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/**  ---Event DELETE---  */

/** @type {import('./$types').RequestHandler} */
export function DELETE({ params, locals }: RequestEvent) {
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
	
	if(!canDelete) throw error(403)
	
	return db.none(
		` DELETE FROM events
            WHERE id = $1
        `,
		[id]
	).then(() => {
		db.none(
			` DELETE FROM event_inscription
				WHERE event_id = $1`
			,[id]
		)
		return new Response
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/**  ---Event PATCH---  */

/** 
 * @param {FormData} request.body the request must be a formdata
 * @param {string} title the title of the event
 * @param {string} category the category of the event
 * @param {string} description the description of the event
 * @param {string} date the UTCdate of the event
 * @param {Blob} image the image of the event
 * @param {string} inscription the string of a boolean, indicating if people can join the event
 * @param {string} inscription_group name of the group that are allowed to join
 * @param {string} inscription_start the UTCdate of when people can join an event
 * @param {string} inscription_stop the UTCdate of when people can no longer join an event
 * @type {import('./$types').RequestHandler} */

export async function PATCH({ params, request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.MODIFY_EVENT, locals.user?.role)) throw error(403)

	const id = params.event_id
	const data = await request.formData()
	
	const parsedData = {
		title: data.get("title")?.toString(),
		category: data.get("category")?.toString(),
		description: data.get("description")?.toString(),
		date: (() => {
			const date = data.get("date")
			if(date == null) return null
			else return new Date(Date.parse(date.toString()))
		})(),
		image: data.get("image")?.valueOf() as Blob,
		inscription: data.get("inscription")?.toString(),
		inscription_group: data.get("inscription_group")?.toString().toUpperCase(),
		inscription_start: (() => {
			const date = data.get("inscription_start")
			if(date == null) return null
			else return new Date(Date.parse(date.toString()))
		})(),
		inscription_stop: (() => {
			const date = data.get("inscription_stop")
			if(date == null) return null
			else return new Date(Date.parse(date.toString()))
		})(),
	}
		
	if (parsedData.inscription_group !== "USER" && parsedData.inscription_group !== "MEMBER" && parsedData.inscription_group !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`UPDATE events SET
			title=$[title], category=$[category],
			description=$[description],date=$[date],
			inscription=$[inscription], inscription_group=$[inscription_group],
			inscription_start=$[inscription_start],inscription_stop=$[inscription_stop]
		WHERE id=$[id]
		RETURNING *;`,
		{id: id, ...parsedData}
	)
		.then(async (res) => {
			if(!parsedData.inscription) {
				db.none(
					` DELETE FROM event_inscription
						WHERE event_id = $1`
					,[id]
				)
			}
			if(parsedData.image) {
				const file = await parsedData.image.arrayBuffer()
				writeFileSync(__envDir + 'data/images/events/' + id + '.png', Buffer.from(file))
			}
			return json(res)
		})
		.catch((err) => {

			console.error(err.message);
			
			throw error(500, err.message)
		})
}