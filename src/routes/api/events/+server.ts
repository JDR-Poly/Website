
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions"
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/**  ---Event POST---  */

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.CREATE_EVENT, locals.user?.role)) throw error(403)

	const body = await request.json()
	const gr = body.inscription_group.toUpperCase();
	if (gr !== "USER" && gr !== "MEMBER" && gr !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`INSERT INTO events
			(title,author,date,inscription,inscription_group,inscription_start,inscription_stop,description)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id;
		`,
		[body.title, locals.user?.id, body.date, body.inscription, gr, body.inscription_start, body.inscription_stop, body.description],
		a => a.id
		)
		.then((res) => {
			return json({id: res})
		})
		.catch((err) => {
			throw error(500, err.message)
		})

}

/**  ---Events GET---  */

/**
 * Get all events sorted by their date
 * @type {import('./$types').RequestHandler} 
 * @param {boolean?} url.searchParams.excludeExpiredEvents exclude event in the past (default true) 
 * @return {Event[]} list of events
 * */
export async function GET({ url }: RequestEvent) {
	const excludeExpiredEvents = !(url.searchParams.get("excludeExpiredEvents") === "false")
		
	const db_req = excludeExpiredEvents ?
		`SELECT * FROM events
		WHERE date >= $1
		ORDER BY date;
		`
		: 
		`SELECT * FROM events
		ORDER BY date;
		`

	return db.any(db_req, [new Date(Date.now())])
		.then((result) => {
			return json(result)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}