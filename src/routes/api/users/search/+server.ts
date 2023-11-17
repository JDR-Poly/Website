import { error, json } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import type { RequestHandler } from "./$types";

/**
 * Search a certain number of userwhere user/mail matches
 * text (with an index) by id decreasing
 * @param {number} url.searchParams.number how many users to look for (default all)
 * @param {number} url.searchParams.index index from which to start returning users from
 * @param {string} url.searchParams.searchText name to look for
 * @return {User[]} users found
 */

export const GET = (async ({ url, locals }) => {
	if(!locals.authenticated) throw error(401)
 	if(!hasRolePermission(UserPermission.SEE_USERS_PROFILE, locals.user?.role)) throw error(403)

	const number = parseInt(url.searchParams.get("number") || "null") || null
	const index = parseInt(url.searchParams.get("index") || "0") || 0
	const searchText = (url.searchParams.get("searchText") != undefined ? "%" + (url.searchParams.get("searchText") || "") + "%" : "%")
	const mailSQLText = locals.authenticated && hasRolePermission(UserPermission.SEE_MAIL, locals.user?.role) ? "email, " : "" 

	return db.any(
		`SELECT id, ${mailSQLText}name, role 
		FROM users WHERE name ~~* $1 OR email ~~* $1
		ORDER BY id DESC
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