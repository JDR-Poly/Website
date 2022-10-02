import { error, json } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient"
import { Roles } from "$lib/userPermissions";
import type { RequestEvent } from "./$types";

/** @type {import('./$types').RequestHandler} */
export function GET({ }: RequestEvent) {
	return db.any(
		` SELECT 
			id, email, name, role, account_creation, discord_id, avatar_id, bio, member_start, member_stop 
			FROM users`
	)
		.then((res) => {
			return json(res.map(v => {
				v.role = Roles[v.role]
				return v
			}))
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}