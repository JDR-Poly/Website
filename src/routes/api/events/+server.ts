
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, Roles, UserPermission } from "$lib/userPermissions"
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { __envDir, getByteArrayFromBase64 } from "$lib/utils";
import type { DateString } from "$gtypes";

/**
 * Create an event
 * 
 * @param {string} title the title of the event
 * @param {string} category the category of the event
 * @param {string?} description the description of the event
 * @param {DateString} date the local date of the event
 * @param {string?} image the base64 image of the event
 * @param {string} inscription the string of a boolean, indicating if people can join the event
 * @param {string?} inscription_group name of the group that are allowed to join
 * @param {number?} inscription_limit limit of people that can subscribe to this event
 * @param {DateString?} inscription_start the local date of when people can join an event
 * @param {DateString?} inscription_stop the local date of when people can no longer join an event
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.CREATE_EVENT, locals.user?.role)) throw error(403)

	const data = await request.json()
	if(data.image) data.image = getByteArrayFromBase64(data.image)
	
	if (data.inscription_group !== Roles.USER.name && data.inscription_group !== Roles.MEMBER.name && data.inscription_group !== Roles.COMMITTEE.name) throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`INSERT INTO events
			(title,author,category,date,inscription,inscription_group, inscription_limit, inscription_start,inscription_stop,description, image)
		VALUES
			($[title], $[author], $[category], $[date], $[inscription], $[inscription_group], $[inscription_limit], $[inscription_start], $[inscription_stop], $[description], $[image])
		RETURNING id;`,
		{...data, author: locals.user?.id},
		a => a.id)
		.then((id) => {
			return json({ id })
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler

/**
 * Get all events sorted by their date
 * @param {boolean?} url.searchParams.excludeExpiredEvents exclude event in the past (default true)
 * @param {boolean?} url.searchParams.noImage don't send images (default false)
 * @param {number} url.searchParams.limit how many events to search for
 * @return {Event[]} list of events
 * */
export const GET = (async ({ url }) => {
	const excludeExpiredEventsString = !(url.searchParams.get("excludeExpiredEvents") === "false") ? "WHERE date >= $[date]" : ""
	const noImage = url.searchParams.get("noImage") === "true" ? "" : ", image"
	const limit = parseInt(url.searchParams.get("limit") || "null") || null	

	const nowLenient = new Date(Date.now())
	nowLenient.setHours(nowLenient.getHours() - 3)
	const db_req = `SELECT id, title, author, category, date, inscription, inscription_group, inscription_limit, inscription_start, inscription_stop, description${noImage} FROM events
					${excludeExpiredEventsString}
					ORDER BY date LIMIT $[limit];
					`
	return db.any(
		db_req, 
		{
			date: nowLenient,
			limit: limit
		}
	)
		.then((res) => {
			res.forEach((v) => {
				if (v.image) {
					v.imageb64 = Buffer.from(v.image).toString("base64") //Convert to base64
					v.image = undefined
				}
			})			
			return res
		})
		.then((result) => {
			return json(result)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler