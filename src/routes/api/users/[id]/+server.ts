import { db } from "$lib/server/postgresClient";
import type { RequestEvent } from "./$types";
import { error, json } from '@sveltejs/kit';
import { Roles } from "$lib/userPermissions";

/** @type {import('./$types').RequestHandler} */
export function GET({ params }: RequestEvent) {
	const id = params.id

	return db.one(
		` SELECT 
			id, email, name, role, account_creation, discord_id, avatar_id, bio, member_start, member_stop 
			FROM users WHERE id = $1`,
		[id]
	)
		.then((res) => {
			res.role = Roles[res.role]
			return json(res)
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}
