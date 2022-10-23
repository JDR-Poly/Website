import { db } from "$lib/server/postgresClient"
import { error as throwError, type Handle, type HandleServerError } from "@sveltejs/kit"
import { Roles } from "$lib/userPermissions"

export const handle: Handle = async function ({ event, resolve }) {
	const session = event.cookies.get('session');

	event.locals.authenticated = false
	event.locals.user = undefined

	if (!session) {
		return resolve(event);
	}

	const id = await db.one(
			"SELECT user_id FROM sessions WHERE cookieId=$1",
			[session],
			a => a.user_id
	)
		.catch(() => {})
	if(!id) return resolve(event);
	
	const user = await db.one(
		`SELECT id, email, name, role, account_creation, is_email_validated 
		FROM users WHERE id=$1`
		,[id]
	)
		.catch((err) => {
			throw throwError(500, err.message)
		})
		
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
		throw throwError(500, `User with email,id ${user.email},${user.id} has an invalid role ${user.role}`)
	}
	return resolve(event);

}

export const handleError: HandleServerError =  ({ error, event }) => {
	const newError = (error as App.Error)
	if(event.routeId === null) {
		return {
			status: 404,
			message: event.url.href		
		}
	} else {
		console.error(newError);
		return {
			status: 500,
			message: "Internal error"
		}
	}

 }
 