import { error, json } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { RequestHandler } from "./$types";

/**
 * Search a certain number of user(max 100) where user/mail matches
 * text (with an index)
 * @param {number} url.searchParams.number how many users to look for (max 100)
 * @param {number} url.searchParams.index index from which to start returning users from (max 100)
 * @param {string} url.searchParams.searchText name to look for
 * @return {User[]} users found
 */

export const GET = (async ({ url, locals }) => {
	const number = Math.min(100, parseInt(url.searchParams.get("number") || "1") || 1)
	const index = Math.min(100, parseInt(url.searchParams.get("index") || "0") || 0)
	const searchText = (url.searchParams.get("searchText") != undefined ? "%" + (url.searchParams.get("searchText") || "") + "%" : "%")
	const mailSQLText = locals.authenticated && hasRolePermission(UserPermission.SEE_MAIL, locals.user?.role) ? "email, " : "" 

	return db.any(
		`SELECT id, ${mailSQLText}name 
		FROM users WHERE name ~~* $1 OR email ~~* $1 
		LIMIT $2 OFFSET $3;`,
		[searchText, number, index]
	)
		.then((res) => {
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}) satisfies RequestHandler