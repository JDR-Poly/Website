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
		
		const conflictUser = await db.any("SELECT email FROM users WHERE email=$1 OR name=$2", [email, username])		
		if(conflictUser.length > 0) {
			throw error(409)
		}
		
		let id = await db.one(
			`INSERT INTO users
			(email, name, password, role, is_email_validated) 
			VALUES
			($1, $2, $3, $4, FALSE) RETURNING id`,
			[email, username, await hash(password!, 15), "USER"],
			a => a.id)
		.catch((err) => {
			throw error(500, err.message)
		})

		sendMailValidationToken(id, email!, url.origin)
		
		let errorMessage: string | undefined
		let attempt = 0
		let cookieId = ''
		do {
			attempt++
			cookieId = uuid()
			errorMessage = undefined

			const expiration_date = new Date(Date.now())
			expiration_date.setDate(expiration_date.getDate() + 14)
			await db.none(
				`INSERT INTO sessions (cookieId, user_id, expiration_date) 
				VALUES($1,$2,$3)`,
				[cookieId, id, expiration_date]
			)
				.then(() => {
					cookies.set('session', cookieId, {
						path: '/',
						httpOnly: true,
						sameSite: 'strict',
						secure: true,
						maxAge: 60 * 60 * 24 * 14
					});
					throw redirect(307, '/')
				})
				.catch(err => {				
					if((err as RequestRedirect)) throw err
					else errorMessage = err.message
				})
		} while (attempt < 3);
		throw error(500, errorMessage)
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