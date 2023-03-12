import { db } from "$lib/server/postgresClient";
import { fail, redirect } from "@sveltejs/kit";
import { compare } from "bcrypt";
import { v4 as uuid } from "uuid";
import type { RequestEvent } from "./$types";
import { hash } from "bcrypt";
import { sendMailValidationToken } from "$lib/server/mailClient";

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }: RequestEvent) {
	if (locals.authenticated && locals.user?.is_email_validated) {
		throw redirect(307, '/');
	} else if(locals.authenticated) {
		throw redirect(307, '/auth/validate-email');
	} 
}

export const actions = {
	login: async ({ request, cookies }: RequestEvent) => {
		const form = await request.formData();

		const email = form.get('email')?.toString();
		const password = form.get('password')?.toString();

		const userResult = await db.any('SELECT id,email,password FROM users WHERE email = $1', [email])
		if(!userResult || userResult.length == 0) return fail(401, { message: "Mail ou mot de passe invalide"})
		const user = userResult[0]

		const isPasswordCorrect = await compare(password!, user.password)
		if (!isPasswordCorrect) {					
			return fail(401, { message: "Mail ou mot de passe invalide"})
		}

		const cookieId = uuid()
		const expiration_date = new Date(Date.now())
		expiration_date.setDate(expiration_date.getDate() + 14)

		//Generate session
		return await db.none(`INSERT INTO sessions (cookieId, user_id, expiration_date) VALUES($1,$2,$3)`,
			[cookieId, user.id, expiration_date]
		)
			.then(() => {
				cookies.set('session', cookieId, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: true,
					maxAge: 60 * 60 * 24 * 14
				});		
				return { sucess: true }
			})
			.catch(err => {		
				return fail(401, { message: err.message})
			})
	},
	register: async ({ request, cookies, url }: RequestEvent) => {
		const form = await request.formData();
		const email = form.get('email')?.toString();
		const username = form.get('username')?.toString();
		const password = form.get('password')?.toString();
	
		if (!validateEmail(email) || !validateUsername(username) || !validatePassword(password))
			return fail(406, { message: "email, username or password invalid"});

		const conflictUser = await db.any("SELECT email FROM users WHERE email=$1 OR name=$2", [email, username])		
		if(conflictUser.length > 0) return fail(409, {message: "Cette utilisateur existe déjà."})

		let id = await db.one(`INSERT INTO users(email, name, password, role, is_email_validated) 
			VALUES ($1, $2, $3, 'USER', FALSE) RETURNING id`,
			[email, username, await hash(password!, 15)],a => a.id)
		
		//Send mail to validate their email
		sendMailValidationToken(id, email!, url.origin)

		//Generate session
		const cookieId = uuid()
		const expiration_date = new Date(Date.now())
		expiration_date.setDate(expiration_date.getDate() + 14)
		return await db.none(`INSERT INTO sessions (cookieId, user_id, expiration_date) VALUES($1,$2,$3)`,
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
				return { success: true }
			})
			.catch(err => {		
				return fail(401, { message: err.message})
			})
	}
};

function validateEmail(email?: string): Boolean { //TODO 
	return true
}

function validateUsername(email?: string): Boolean {
	return true
}

function validatePassword(password?: string): Boolean {
	return true
}