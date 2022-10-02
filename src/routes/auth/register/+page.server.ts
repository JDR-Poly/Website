import { sendMailValidationToken } from "$lib/server/mailClient";
import { db } from "$lib/server/postgresClient";
import { error, invalid, redirect } from "@sveltejs/kit";
import { hash } from "bcrypt";
import { v4 as uuid } from "uuid";
import type { RequestEvent } from "./$types";


/** @type {import('./$types').PageServerLoad} */
export function load({ locals }: RequestEvent) {
	if (locals.authenticated && locals.user?.is_email_validated) {
	  throw redirect(307, '/');
	} else if(locals.authenticated) {
	  throw redirect(307, '/auth/validate-email');
	} 
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies, url }: RequestEvent) => {
		const form = await request.formData();
		const email = form.get('email')?.toString();
		const username = form.get('username')?.toString();
		const password = form.get('password')?.toString();
		
		if (!validateEmail(email) || !validateUsername(username) || !validatePassword(password))
			return invalid(406, { email, username, incorrectFormat: true });
		
		const conflictUser = await db.any("SELECT email FROM users WHERE email=$1", [email])
		if(!conflictUser) {
			throw error(409)
		}
		
		let id = await db.one(
			`INSERT INTO users
			(email, name, password, role, is_email_validated) 
			VALUES
			($1, $2, $3, $4, FALSE) RETURNING id`,
			[email, username, await hash(password!, 15), "USER"])
			.catch((err) => {
				throw error(500, err.message)
			})
		
		if(!id) throw error(500, "User could not be added")
		else id = id.id

		sendMailValidationToken(id, email!, url.origin)
		
		const cookieId = uuid()
		cookies.set('session', cookieId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 60 * 60 * 24 * 14
		});
		console.log('1');
		
		return db.none(
			`INSERT INTO cookies (email, cookieId) 
			VALUES($1,$2)
			ON CONFLICT (email) DO UPDATE SET cookieId=$2`,
			[email, cookieId]
		)
			.then(() => {				
				throw redirect(307, '/')
			})
			.catch(err => {				
				if((err as RequestRedirect)) throw err
				throw error(500, err);
			})
		
	}

};


function validateEmail(email?: string): Boolean {
	return true
}

function validateUsername(email?: string): Boolean {
	return true
}

function validatePassword(password?: string): Boolean {
	return true
}