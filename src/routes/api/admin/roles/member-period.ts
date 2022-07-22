import { getNextPeriod, type Period } from "$lib/backend/memberPeriod"
import { db } from "$lib/backend/postgresClient"
import type {RequestEvent} from "@sveltejs/kit"

/**
 * Return the period of membership of the user depending
 * of how many periods added to the user
 * @param {number} url.searchParams.id id of the period's user
 * @param {number?} url.searchParams.periods how many periods added 
 * @returns {Period} 
 */
export async function get({url}: RequestEvent) {
	//Query user data
	const userResult = (await db.any("SELECT id, member_start, member_stop FROM ${table:name} WHERE id=$[id];", {
		table: "users",
		id: url.searchParams.get("id")
	})).pop()
	if(!userResult) return {status: 404}


	const periodsNumber = parseInt(url.searchParams.get("periods") || "0")
	//Add periods
	let period: Period = {start: userResult.member_start, stop: userResult.member_stop}
	for(let i = 0; i < periodsNumber; i++) {
		period = getNextPeriod(period)
	}

	return {
		status: 200,
		body: {
			period: period	
		}
	}
}

/**
 * Change the period of membership and the role of the user
 * depending of how many periods of membership are added to the user
 * @param {number} request.id the id of the user
 * @param {number} request.periods the number of periods to add
 * @returns user's id, role, member_start and member_stop
 */
export async function post({ request, locals }: RequestEvent) {
	if(!locals.authenticated) return {status: 401}

	const body = await request.json()

	//Query user data
	const userResult = (await db.any("SELECT id, role, member_start, member_stop FROM $[table:name] WHERE id=$[id];", {
		table: "users",
		id: body.id
	})).pop()
	if(!userResult) return {status: 404}


	const periodsNumber = parseInt(body.periods || "1")

	//Add periods
	let period: Period = {start: userResult.member_start, stop: userResult.member_stop}
	for(let i = 0; i < periodsNumber; i++) {
		period = getNextPeriod(period)
	}

	//Define if the member period already started
	const newRole = period.start && period.start! <= new Date(Date.now()) ? "MEMBER" : "USER"

	await db.none("UPDATE $[table:name] SET role=$[role], member_start=$[member_start], member_stop=$[member_stop] WHERE id=$[id]", {
		table: "users",
		member_start: period.start,
		member_stop: period.stop,
		role: newRole,
		id: body.id
	})

	return {
		status: 200,
		body: {
			user: {
				id: body.id,
				role: newRole,
				member_start: period.start,
				member_stop: period.stop
			}	
		}
	}

}