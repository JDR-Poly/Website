import { getNextPeriod, type Period } from "$lib/publicMemberPeriod";
import { updateMemberPeriod } from "$lib/server/memberPeriod";
import { db } from "$lib/server/postgresClient";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

/** 
 * Validate a membership code
 * @param {string} request.validation_token the membership code
 * @type {import('./$types').RequestHandler}  
*/
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw(401)
	const body = await request.json()

	return db.one("SELECT validation_token, periods FROM members_code WHERE validation_token=$1", 
	[body.validation_token])
		.then((res) => {
			return db.one("SELECT id, email, member_start, member_stop, role FROM users WHERE id=$1;",
				[locals.user?.id])
				.then((user) => {
					db.none("DELETE FROM members_code WHERE validation_token=$1",
						[res.validation_token])
					
					let period: Period = { start: user.member_start, stop: user.member_stop }
					for (let i = 0; i < res.periods; i++) {
						period = getNextPeriod(period)
					}
					if(user.role != "USER" && user.role != "MEMBER") updateMemberPeriod(user, period)
					return new Response("User membership period updated")
				})
		})
		.catch((err) => {
			throw error(500, err.message)
		})
}