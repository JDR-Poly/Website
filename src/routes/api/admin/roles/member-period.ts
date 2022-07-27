import { hasRolePermission } from "$lib/backend/backendPermissions"
import { getNextPeriod, updateMemberPeriod, type Period } from "$lib/backend/memberPeriod"
import { db } from "$lib/backend/postgresClient"
import { user } from "$lib/stores"
import { UserPermission } from "$lib/userPermissions"
import type { RequestEvent } from "@sveltejs/kit"

/**
 * Return the period of membership of the user depending
 * of how many periods added to the user
 * @param {number} url.searchParams.id id of the period's user
 * @param {number?} url.searchParams.periods how many periods added 
 * @returns {Period} 
 */
export async function get({ url }: RequestEvent) {
	//Query user data
	const userResult = (await db.any("SELECT id, member_start, member_stop FROM ${table:name} WHERE id=$[id];", {
		table: "users",
		id: url.searchParams.get("id")
	})).pop()
	if (!userResult) return { status: 404 }


	const periodsNumber = parseInt(url.searchParams.get("periods") || "0")
	//Add periods
	let period: Period = { start: userResult.member_start, stop: userResult.member_stop }
	for (let i = 0; i < periodsNumber; i++) {
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
 * @returns user's id, member_start and member_stop
 */
export async function post({ request, locals }: RequestEvent) {
	if (!locals.authenticated) return {
		status: 401,
		body: {
			message: "User is not authenticated"
		}
	}

	if (!hasRolePermission(locals.user?.role!, UserPermission.GRANT_ROLE_MEMBER)) {
		return {
			status: 403,
			body: {
				message: "User doesn't have the permission to do that"
			}
		}
	}
	const body = await request.json()

	//Query user data
	const userResult = (await db.any("SELECT id, role, member_start, member_stop FROM $[table:name] WHERE id=$[id];", {
		table: "users",
		id: body.id
	})).pop()
	if (!userResult) return {
		status: 404,
		body: {
			message: "User does not exist"
		}
	}
	if (userResult.role !== "USER" && userResult.role !== "MEMBER") {
		return {
			status: 400,
			body: {
				message: "The user to modify needs to be a USER or a MEMBER"
			}
		}
	}


	const periodsNumber = parseInt(body.periods || "1")

	//Add periods
	let period: Period = { start: userResult.member_start, stop: userResult.member_stop }
	for (let i = 0; i < periodsNumber; i++) {
		period = getNextPeriod(period)
	}

	updateMemberPeriod({ id: body.id }, period)

	return {
		status: 200,
		body: {
			user: {
				id: body.id,
				member_start: period.start,
				member_stop: period.stop
			},
			message: "Added period to user"
		}
	}

}