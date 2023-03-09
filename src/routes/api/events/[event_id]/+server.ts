import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
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

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.MODIFY_EVENT, locals.user?.role)) throw error(403)

	const id = params.event_id
	const body = await request.json()

	const gr = body.inscription_group.toUpperCase();
	if (gr !== "USER" && gr !== "MEMBER" && gr !== "COMMITTEE") throw error(400, "inscription_group is not valid, should be either user, member or committee")

	return db.one(
		`UPDATE events SET
			title=$2, date=$3,
			inscription=$4,inscription_group=$5,
			inscription_start=$6, inscription_stop=$7,
			description=$8,category=$9
		WHERE id=$1
		RETURNING *;
		`,
		[id, body.title, body.date, body.inscription, gr, body.inscription_start, body.inscription_stop, body.description, body.category]
	)
		.then((res) => {
			if(!body.inscription) {
				db.none(
					` DELETE FROM event_inscription
						WHERE event_id = $1`
					,[id]
				)
			}
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}