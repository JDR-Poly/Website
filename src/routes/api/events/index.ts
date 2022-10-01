
import { isLocalsMissingPermission } from "$lib/backend/backendPermissions"
import { db } from "$lib/backend/postgresClient"
import { UserPermission } from "$lib/userPermissions"
import type { RequestEvent } from "@sveltejs/kit"

/**  ---Event POST---  */

export async function post({ request, locals }: RequestEvent) {
	const permsResult = isLocalsMissingPermission(locals, UserPermission.CREATE_EVENT)
	if(permsResult) return permsResult

	const body = await request.json()
	const gr = body.inscription_group.toUpperCase();
	if(gr !== "USER" && gr !== "MEMBER" && gr !== "COMMITTEE") return {
		stauts: 500,
		body: {
			message: "inscription_group is not valid, should be either user, member or committee"
		}
	}

	return db.none(
		`INSERT INTO events
			(title,author,date,inscription,inscription_group,inscription_start,inscription_stop,description)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8);
		`,
		[body.title, locals.user?.id, body.date, body.inscription, gr, body.inscription_start, body.inscription_stop, body.description]
	)
	.then(() => {
		return {
			status: 200,
			body: {
				message: "Event sucessfully created"
			}
		}
	})
	.catch((err) => {
		return {
			status: 500,
			body: {
				message: (err as any).message
			}
		}
	})

}

/**  ---Event GET---  */

export async function get({ locals }: RequestEvent) {

	return db.any('SELECT * FROM events')
		.then((result) => {
			return {
				status: 200,
				body: {
					events: (result as any),
					message: "Successfully requested events"
				}
			}
		})
		.catch((err) => {
			return {
				status: 500,
				body: {
					message: (err as any).message
				}
			}
		})
}