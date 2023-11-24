/** @format */

import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";

/**
 * Delete a book
 */
export const DELETE = (async ({ params, locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.role))
		throw error(403, "User doesn't have the permission to do that");

	const book_id = params.id;

	return db
		.none(`DELETE FROM books WHERE id = $1`, [book_id])
		.then(async () => {
			await resortItemOrder();
			return new Response();
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/*
	Change the database so that all the books are in the correct item_order 
*/
async function resortItemOrder() {
	await db
		.any("SELECT id, item_order FROM books")
		.then(async (res) => {
			res = res.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
			let i = 0;
			let newOrder: [number, number][] = [];
			for (let value of res) {
				newOrder.push([value.id, i]);
				i++;
			}

			await db.tx((t) => {
				//Perform a list of SQL request
				let queries: Promise<null>[] = [];
				for (let value of newOrder) {
					queries.push(
						t.none(
							`UPDATE books SET
						item_order = $2
						WHERE id = $1`,
							value,
						),
					);
				}
				return t.batch(queries); //Execute all the queries
			});
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}
