
import { hasRolePermission } from "$lib/server/backendPermissions"
import { db } from "$lib/server/postgresClient"
import { UserPermission } from "$lib/userPermissions"
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/**  ---Event POST---  */

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(locals.user?.role!, UserPermission.CREATE_EVENT)) throw error(403)

	const body = await request.json()
	const gr = body.inscription_group.toUpperCase();
	if (gr !== "USER" && gr !== "MEMBER" && gr !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.none(
		`INSERT INTO events
			(title,author,date,inscription,inscription_group,inscription_start,inscription_stop,description)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8);
		`,
		[body.title, locals.user?.id, body.date, body.inscription, gr, body.inscription_start, body.inscription_stop, body.description]
	)
		.then(() => {
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})

}

/**  ---Events GET---  */

/** @type {import('./$types').RequestHandler} */
export async function GET({ }: RequestEvent) {
	return db.any('SELECT * FROM events')
		.then((result) => {
			return json(result)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}