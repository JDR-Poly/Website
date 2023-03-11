import { error, json } from "@sveltejs/kit";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { RequestEvent } from "./$types";
import { db } from "$lib/server/postgresClient";
import type { HonorMember } from "$gtypes";


/**
 * Get all the members of honor for /docs/
 * @type {import('./$types').RequestHandler}
*/
export async function GET({ }: RequestEvent) {
	return db.any("SELECT * FROM honor_members")
		.then((res) => {
			return json(res)
		})
		.catch((err) => { throw error(500, err.message) })
}

/**
 * Add a member of honor for /docs/
 * @type {import('./$types').RequestHandler}
 * @param {RequestEvent} request
 * @param {string} request.name the name of the member ("Scrooge Mcduck")
 * @param {string} request.description the description of the member (ex: "Never gave any penny")
*/
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const body = await request.json()
	if (!hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")

	return db.any("SELECT item_order FROM honor_members")
		.then((res) => {
			res.push({ item_order: -1 }) //If the array is empty, set the max to -1 so that the new order will be 0
			const maxOrder = Math.max(...res.map((v) => v.item_order))

			db.none(
				`INSERT INTO honor_members
				(name,description,item_order)
				VALUES ($1,$2,$3)`
				,[body.name, body.description, maxOrder + 1]
			)
			return new Response()
		})
		.catch((err) => { throw error(500, err.message) })

}

/**
 * Update one or a list of members of honor
 * @param {RequestEvent} request
 * @param {HonorMember | HonorMember[]} request.body the member(s) to update
 * @type {import('./$types').RequestHandler} 
 */
export async function PATCH({ locals, request }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	let body = await request.json()
	if (!hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")
	if (!Array.isArray(body)) body = [body]

	return db.tx(t => { //Perform a list of SQL request

		let queries: Promise<null>[] = []
		for (let member of (body as HonorMember[])) {
			queries.push(t.none(`UPDATE honor_members SET
				name = $[name], description = $[description],
				item_order = $[item_order]
				WHERE id = $[id]`
				, member))
		}
		return t.batch(queries); //Execute all the queries
	})
		.then(() => {
			return new Response()
		})
		.catch(err => {
			throw error(500, err.message)
		});
}
