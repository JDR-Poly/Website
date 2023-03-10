import { error } from "@sveltejs/kit";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { RequestEvent } from "./$types";
import { db } from "$lib/server/postgresClient";
import type { Committee } from "src/types";
import { writeFileSync } from 'fs';



/**
 * Add a new committee to the committee page
 * @type {import('./$types').RequestHandler}
 * @param {RequestEvent} request
 * @param {string} request.category the category of the committee (ex: "2022-2023")
 * @param {string} request.title the title of the committee (ex: "President")
 * @param {string?} request.name the name of the committee (ex: "Bob Moran")
 * @param {string?} request.description the description of the committee
 * @param {string?} request.imgBase64 the imgBase64 of the image
*/
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	const body = await request.json()
	if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")
	if (!body.category) throw error(400, 'No category found')


	return db.any("SELECT item_order FROM committee_info WHERE category = $1", [body.category])
		.then((res) => {
			res.push({ item_order: -1 }) //If the array is empty, set the max to -1 so that the new order will be 0
			const maxOrder = Math.max(...res.map((v) => v.item_order))

			return db.one(
				`INSERT INTO committee_info
				(category,title,item_order,name,description)
				VALUES ($1,$2,$3,$4,$5) RETURNING id`
				, [body.category, body.title, maxOrder + 1, body.name, body.description],
				a => a.id
			)
				.then((id) => {					
					writeFileSync('static/data/images/committee/' + id + '.png', body.imgBase64, 'base64')
					return new Response()
				})
		})
		.catch((err) => { throw error(500, err.message) })

}

/**
 * Update one or a list of committees
 * @param {RequestEvent} request
 * @param {Committee || Committee[]} request.body the committee(s) to update
 * @type {import('./$types').RequestHandler} 
 */
export async function PATCH({ locals, request }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	let body = await request.json()
	if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")
	if (!Array.isArray(body)) body = [body]

	return db.tx(t => { //Perform a list of SQL request

		let queries: Promise<null>[] = []
		for (let committee of (body as Committee[])) {
			queries.push(t.none(`UPDATE committee_info SET
				category = $[category], title = $[title],
				name = $[name], description = $[description],
				item_order = $[item_order]
				WHERE id = $[id]`
				, committee))
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
