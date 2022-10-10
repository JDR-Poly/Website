import { db } from "$lib/server/postgresClient";
import { error, invalid, redirect } from "@sveltejs/kit";
import { compare } from "bcrypt";
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
	default: async ({ request, cookies }: RequestEvent) => {
		const form = await request.formData();
		const email = form.get('email')?.toString();
		const password = form.get('password')?.toString();
		if (!validateEmail(email) || !validatePassword(password))
			return invalid(400, { email, incorrectFormat: true });
		
		return db.one('SELECT id,email,password FROM users WHERE email = $1', [email])
			.then(async data => {
				if (!await compare(password!, data.password)) {
					throw invalid(401, { email, wrongCreditentials: true })
				}

				const cookieId = uuid()
				cookies.set('session', cookieId, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: true,
					maxAge: 60 * 60 * 24 * 14
				});
				return db.none(`INSERT INTO cookies (email, cookieId) 
							VALUES($1,$2)
						ON CONFLICT (email) DO UPDATE SET cookieId=$2`,
						[email, cookieId])
					.then(_ => {
						throw redirect(307, '/users/profile/' + data.id)
					})
					.catch(err => {
						if((err as RequestRedirect)) throw err
						throw error(500, err);
					})
			})
			.catch(err => {
				if((err as RequestRedirect)) throw err
				return invalid(401, { email, wrongCreditentials: true })
			})
	}

};


function validateEmail(email?: string): Boolean {
	return true
}

function validatePassword(password?: string): Boolean {
	return true
}