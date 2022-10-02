import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/server/memberPeriod"
import { db } from "$lib/server/postgresClient"
import { hasRolePermission, UserPermission } from "$lib/userPermissions"
import { error, json, type RequestEvent } from "@sveltejs/kit"

/**
 * Return the period of membership of the user depending
 * of how many periods added to the user
 * @type {import('./$types').RequestHandler}
 * @param {Id} url.searchParams.id id of the period's user
 * @param {number?} url.searchParams.periods how many periods added 
 * @returns {Period} 
 */
 export async function GET({ url}: RequestEvent) {	
	//Query user data
	return db.one("SELECT id, member_start, member_stop FROM users WHERE id=$1;",
		[url.searchParams.get("id")]
	)
	.then((res) => {
		const periodsNumber = parseInt(url.searchParams.get("periods") || "0")
		let period: Period = { start: res.member_start, stop: res.member_stop }

		//Add periods
		for (let i = 0; i < periodsNumber; i++) {
			period = getNextPeriod(period)
		}

		return json(period)
	}).catch((err) => {
		throw error(500, err.message)
	})
}

/**
 * Change the period of membership and the role of the user
 * depending of how many periods of membership are added to the user
 * @type {import('./$types').RequestHandler}
 * @param {Id} request.id the id of the user
 * @param {number} request.periods the number of periods to add
 * @returns user's id, member_start and member_stop
 */
export async function POST({ request, locals }: RequestEvent) {
	if (!locals.authenticated) throw error(401)

	if (!hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, locals.user?.role))
		throw error(403)
	
	const body = await request.json()

	return db.one("SELECT id, role, member_start, member_stop FROM users WHERE id=$1;",
		[body.id]
	)
	.then((user) => {
		if (user.role !== "USER" && user.role !== "MEMBER") {
			throw error(400, "The user modified needs to be a USER or a MEMBER")
		}

		const periodsNumber = parseInt(body.periods || "1")
		//Add periods
		let period: Period = { start: user.member_start, stop: user.member_stop }
		for (let i = 0; i < periodsNumber; i++) {
			period = getNextPeriod(period)
		}
		updateMemberPeriod({ id: body.id }, period)
		
		//Return new period
		return json({
			user: {
				id: body.id,
				member_start: period.start,
				member_stop: period.stop
			},
			message: "Added period to user"
		})
	})
	.catch((err) => {
		throw error(500, err.message)
	})
}