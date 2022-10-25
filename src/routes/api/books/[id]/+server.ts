import type { RequestEvent } from "./$types";
import { error } from '@sveltejs/kit';
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";


/**
 * Delete a book
 * @type {import('./$types').RequestHandler} 
 */
export function DELETE({ params, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")

	const book_id = params.id

	return db.none(
		`DELETE FROM books WHERE id = $1`,
		[book_id]
	)
		.then(() => {
			return new Response()
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}

/**
 * Update a book
 * @param {RequestEvent} request
 * @param {string} request.title the book title
 * @param {number} request.item_order the book item_order
 * @param {string} request.caution the book caution
 * @param {string} request.status the availablity of the book
 * @type {import('./$types').RequestHandler} 
 */
export async function PATCH({ locals, request, params }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	let body = await request.json()
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.role)) throw error(403, "User doesn't have the permission to do that")

	return db.none(`UPDATE books SET
		title = $[title], caution = $[caution],
		status = $[status], item_order = $[item_order]
		WHERE id = $[id]`
		, { ...body, id: params.id })
		.then(() => {
			return new Response()
		})
		.catch(err => {
			throw error(500, err.message)
		});
}