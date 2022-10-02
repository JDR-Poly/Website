import { hasRolePermission } from "$lib/server/backendPermissions";
import { db } from "$lib/server/postgresClient";
import { UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/**  ---Event GET---  */

/** @type {import('./$types').RequestHandler} */
export function GET({ params }: RequestEvent) {
	const id = params.id
	return db.one(
		` SELECT * FROM events
            WHERE id = $1
        `,
		[id]
	).then((res) => {
		return json(res)
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/**  ---Event DELETE---  */

/** @type {import('./$types').RequestHandler} */
export function DELETE({ params, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(locals.user?.role!, UserPermission.MODIFY_EVENT)) throw error(403)

	const id = params.id
	return db.none(
		` DELETE FROM events
            WHERE id = $1
        `,
		[id]
	).then(() => {
		return new Response
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/**  ---Event PATCH---  */

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(locals.user?.role!, UserPermission.MODIFY_EVENT)) throw error(403)

	const id = params.id
	const body = await request.json()

	const gr = body.inscription_group.toUpperCase();
	if (gr !== "USER" && gr !== "MEMBER" && gr !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`UPDATE events SET
			title=$2, date=$3,
			inscription=$4,inscription_group=$5,
			inscription_start=$6, inscription_stop=$7,
			description=$8
		WHERE id=$1
		RETURNING *;
		`,
		[id, body.title, body.date, body.inscription, gr, body.inscription_start, body.inscription_stop, body.description]
	)
		.then((res) => {
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}