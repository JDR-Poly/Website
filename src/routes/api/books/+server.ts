/** @format */

import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { Book } from "$gtypes";

/**
 * Get all the books
 */
export const GET = (async ({}) => {
	return db
		.any(` SELECT * FROM books`)
		.then((res) => {
			return json(res);
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Add a new book
 * @param {string} request.title the title of the book
 * @param {string} request.caution the caution for this book
 * @param {string} request.status the availablity of the book
 */
export const POST = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401);

	const body = await request.json();
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.roleString))
		throw error(403, "User doesn't have the permission to do that");

	return db
		.any("SELECT item_order FROM books")
		.then((res) => {
			res.push({ item_order: -1 }); //If the array is empty, set the max to -1 so that the new order will be 0
			const maxOrder = Math.max(...res.map((v) => v.item_order));

			return db
				.none(
					`INSERT INTO books
				(title,item_order,caution,status)
				VALUES ($1,$2,$3,$4) RETURNING id`,
					[body.title, maxOrder + 1, body.caution, body.status],
				)
				.then(() => {
					return new Response();
				});
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;

/**
 * Update a book or a list of books
 * @param {RequestEvent} request
 * @param {Book | Book[]} request.body the book(s) to update
 */
export const PATCH = (async ({ request, locals }) => {
	if (!locals.authenticated) throw error(401);

	let body = await request.json();
	if (!hasRolePermission(UserPermission.MODIFY_BOOKS, locals.user?.roleString))
		throw error(403, "User doesn't have the permission to do that");
	if (!Array.isArray(body)) body = [body];

	return db
		.tx((t) => {
			//Perform a list of SQL request

			let queries: Promise<null>[] = [];
			for (let book of body as Book[]) {
				queries.push(
					t.none(
						`UPDATE books SET
				title = $[title], caution = $[caution],
				status = $[status], item_order = $[item_order]
				WHERE id = $[id]`,
						book,
					),
				);
			}
			return t.batch(queries); //Execute all the queries
		})
		.then(() => {
			return new Response();
		})
		.catch((err) => {
			throw error(500, err.message);
		});
}) satisfies RequestHandler;
