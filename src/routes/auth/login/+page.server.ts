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
			.then(async (data) => {				
				const isPasswordCorrect = await compare(password!, data.password)
				if (!isPasswordCorrect) {					
					return invalid(401, { email, wrongCreditentials: true })
				}

				let errorMessage: string | undefined
				let attempt = 0
				//3 attemps to generate a sessionId
				do {
					attempt++
					const cookieId = uuid()
					errorMessage = undefined

					const expiration_date = new Date(Date.now())
					expiration_date.setDate(expiration_date.getDate() + 14)

					await db.none(
						`INSERT INTO sessions (cookieId, user_id, expiration_date) 
						VALUES($1,$2,$3)`,
						[cookieId, data.id, expiration_date]
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
				throw error(500, errorMessage) //If failed 5 times, throw the error
			})
			.catch(err => {
				if((err as RequestRedirect)) throw err
				console.log(err);
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