import type { RequestEvent } from "./$types";
import { error } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";

/**
 * Delete a committee from the committee page
 * @type {import('./$types').RequestHandler} 
 */
export function DELETE({ params, locals}: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")

	const committee_id = params.id

	return db.none(
		`DELETE FROM committee_info WHERE id = $1`,
		[committee_id]
	)
		.then(async () => {
			await resortItemOrder()
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}

/*
	Change the database so that all the books are in the correct item_order 
*/
async function resortItemOrder() {
	await db.any('SELECT id, item_order FROM committee_info')
		.then(async (res) => {
			res = res.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1))
			let i = 0
			let newOrder: [number, number][] = []
			for(let value of res) {
				newOrder.push([value.id,i])
				i++
			}

			await db.tx(t => { //Perform a list of SQL request
				let queries: Promise<null>[] = []
				for (let value of newOrder) {
					queries.push(t.none(`UPDATE committee_info SET
						item_order = $2
						WHERE id = $1`
						, value))
				}
				return t.batch(queries); //Execute all the queries
			})
		})
		.catch((err) => {throw error(500, err.message)})
}