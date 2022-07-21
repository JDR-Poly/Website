import cookie from "cookie"
import { db } from "$lib/backend/postgresClient"
import type { GetSession, Handle } from "@sveltejs/kit"
import { Roles } from "$lib/userPermissions"

export const handle: Handle = async function ({ event, resolve }) {
	const cookies = cookie.parse(event.request.headers.get('cookie') || "")
	event.locals.authenticated = false
	if (!cookies.session_id) {
		return resolve(event);
	}

	const email = (await db.any("SELECT email FROM ${table:name} WHERE cookieId=$[cookieId]", {
		table: "cookies",
		cookieId: cookies.session_id
	})).pop()
	if (email) {
		const user = (await db.any("SELECT id, email, name, role, account_creation, is_email_validated  FROM ${table:name} WHERE email=$[email]", {
			table: "users",
			email: email.email
		})).pop()
		//Check that the role is correct
		const role = Roles[user.role]
		if (role) {
			event.locals = {
				authenticated: true,
				user: {
					id: user.id,
					email: user.email,
					role: role.toJSON(),
					name: user.name,
					accountCreation: user.account_creation,
					isEmailValidated: user.is_email_validated
				}
			}
		} else {
			console.error("User with email,id %f,%f has an invalid role %f", user.email, user.id, user.role)
		}

	}
	return resolve(event);

}

export const getSession: GetSession = async function (event) {
	if (!event.locals.authenticated) {
		return {
			authenticated: false
		}
	} else {
		return {
			authenticated: true,
			user: event.locals.user
		}
	}
}