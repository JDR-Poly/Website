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
		.then(() => {
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}