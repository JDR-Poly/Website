import { error } from "@sveltejs/kit";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/postgresClient";
import type { Committee } from "$gtypes";
import { __envDir } from "$lib/utils";

/**
 * Update one or a list of committees
 * does not accept image modification
 * @param {Committee | Committee[]} request.body the committee(s) to update
 */
export const PATCH = (async ({ request, locals }) => {
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
}) satisfies RequestHandler
