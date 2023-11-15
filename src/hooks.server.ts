import { db } from "$lib/server/postgresClient"
import { error as throwError, type Handle, type HandleServerError } from "@sveltejs/kit"
import { Roles } from "$lib/userPermissions"
import type { User } from "$gtypes";
import { logger } from "$lib/server/logger";

//Handle is fired before each request, it handles authentification already connected clients.
export const handle: Handle = async function ({ event, resolve }) {
	const session = event.cookies.get('session');

	//Default data to pass to sveltekit if no session
	event.locals.authenticated = false
	event.locals.user = undefined

	if (!session) {
		return resolve(event);
	}

	//Get user session
	const id = await db.one(
			"SELECT user_id FROM sessions WHERE cookieId=$1",
			[session],
			a => a.user_id
	).catch(() => {})
	if(!id) return resolve(event);
	
	//Get user
	const user: User = await db.one(
		`SELECT id, email, name, role, account_creation, is_email_validated, member_start, member_stop
		FROM users WHERE id=$1`
		,[id]
	).then((user) => {
		user.role = Roles[user.role].toJSON() //From role string, get role object
		if (!user.role) {
			throw throwError(500, `User with email,id ${user.email},${user.id} has an invalid role ${user.role}`)
		}
		return user
	}).catch((err) => {
		throw throwError(500, err.message)
	})
	
	//Transfer data to sveltekit
	event.locals = {
		authenticated: true,
		user: user
	}
	return resolve(event);
}

export const handleError: HandleServerError =  ({ error, event }) => {
	const newError = (error as App.Error)
	if(event.route.id === null) { //On route not found, redirect to page 404
		return {
			status: 404,
			message: event.url.href		
		}
	} else {
		logger.error(newError);
		return {
			status: newError.status,
			message: "Internal error"
		}
	}
 }
 