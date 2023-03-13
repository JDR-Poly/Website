import { db } from "$lib/server/postgresClient";
import { hasRolePermission } from "$lib/userPermissions";
import { error, json } from "@sveltejs/kit";
import type { Event } from "$gtypes";
import type { RequestEvent } from "./$types";

/** 
 * Get the list of all users subscribed to an event
 * @type {import('./$types').RequestHandler} 
 */
 export function GET({ params }: RequestEvent) {
	const event_id = params.event_id
	return db.any(
		`SELECT
			users.id as id,
			users.name as name
		FROM
			users
			INNER JOIN event_inscription ON users.id = event_inscription.user_id
			AND event_inscription.event_id = $1;`
	,[event_id]
	).then((res) => {	
		return json(res)		
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/** 
 * Allows the user to subscribe itself to an event
 * @type {import('./$types').RequestHandler} 
 */
 export function POST({ params, locals }: RequestEvent) {
	if(!locals.authenticated) throw error(401)
	
	const event_id = params.event_id

	return db.one(
		` SELECT * FROM events
            WHERE id = $1
        `,
		[event_id]
	).then((event: Event) => {
		if(!event.inscription) throw error(400, "Can't subscribe to an event where there is no inscription")
		if (!hasRolePermission('JOIN_EVENT_' + event.inscription_group.toUpperCase(), locals.user?.role)) 
			throw error(403)
		
		return db.none(
			`INSERT into event_inscription(user_id, event_id)
			VALUES ($1,$2)`
			,[locals.user?.id, event_id])
			.then(() => {
				return new Response()
			})
	}).catch((err) => {		
		throw error(500, err.message)
	})
}

/** 
 * Allows the user to remove itself from an event
 * @type {import('./$types').RequestHandler} 
 */
 export async function DELETE({ params, request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const event_id = params.event_id

	return db.none(
		` DELETE FROM event_inscription
            WHERE user_id = $1 AND event_id = $2
        `,
		[locals.user?.id, event_id]
	)
	.then(() => {
		return new Response()
	})
	.catch((err) => {				
		throw error(500, err.message)
	})
}