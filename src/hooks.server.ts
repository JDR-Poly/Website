import { db } from "$lib/server/postgresClient"
import type { Handle } from "@sveltejs/kit"
import { Roles } from "$lib/userPermissions"

export const handle: Handle = async function ({ event, resolve }) {
	const session = event.cookies.get('session');

	event.locals.authenticated = false
	event.locals.user = undefined

	if (!session) {
		return resolve(event);
	}

	const email = (await db.any("SELECT email FROM cookies WHERE cookieId=$1",
		[session])).pop()?.email
	

	if (email) {		
		const user = await db.one(
			`SELECT id, email, name, role, account_creation, is_email_validated 
			FROM users WHERE email=$1`
			, [email]
		)
		const role = Roles[user.role]
		if (role) {
			event.locals = {
				authenticated: true,
				user: {
					id: user.id,
					email: user.email,
					role: role.toJSON(),
					name: user.name,
					account_creation: user.account_creation,
					is_email_validated: user.is_email_validated
				}
			}
		} else {
			console.error("User with email,id %f,%f has an invalid role %f", user.email, user.id, user.role)
		}
	}
	return resolve(event);

}