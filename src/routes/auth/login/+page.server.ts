import { db } from "$lib/server/postgresClient";
import { fail, redirect } from "@sveltejs/kit";
import { compare } from "bcrypt";
import { v4 as uuid } from "uuid";
import type { RequestEvent } from "./$types";
import { hash } from "bcrypt";
import { sendMail, sendMailValidationToken } from "$lib/server/mailClient";
import { readFile } from "fs/promises";
import { __envDir } from "$lib/utils";
import type { PageServerLoad } from './$types';

export const load = (({locals}) => {
	if (locals.authenticated && locals.user?.is_email_validated) {
		throw redirect(307, '/');
	} else if(locals.authenticated) {
		throw redirect(307, '/auth/validate-email');
	} 
}) satisfies PageServerLoad;

export const actions = {
	login: async ({ request, cookies }: RequestEvent) => {
		const form = await request.formData();

		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString().trim();

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
					sameSite: 'lax',
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
		const email = form.get('email')?.toString().trim();
		const username = form.get('username')?.toString().trim();
		const password = form.get('password')?.toString().trim();
	
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
					sameSite: 'lax',
					secure: true,
					maxAge: 60 * 60 * 24 * 14
				});		
				return { success: true }
			})
			.catch(err => {		
				return fail(401, { message: err.message})
			})
	},
	/**
	 * Reset a password from the email
	 * Generate a new password sent by email
	 * @param {string} request.email 
	 */
	resetPassword: async ({ request, url }: RequestEvent) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim();

		if(!email) return fail(400, { message: "Email not defined."})
		
		const newPassword = generatePassword(12)
		const hashPassword = await hash(newPassword!, 15)

		return await db.one('UPDATE users SET password=$1 WHERE email=$2 RETURNING id;', [hashPassword, email], a => a.id)
			.then(async () => {
				let text = await readFile(__envDir + 'mails/resetPassword.html', 'utf-8')
				text = text.replace("%PASSWORD%", newPassword)
				const res = await sendMail(email, "JDRPoly : Mot de passe réinitialisé", text)
				if(res instanceof Error) return fail(400, { message: "Mail couldn't be sent"})
				return { success: true }
			})
			.catch((err) => {
				return fail(500	, { message: err.message})
			})
	}
};

function validateEmail(email?: string): Boolean { 
	if(!email) return false
	return new RegExp("^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$").test(email)
}

function validateUsername(email?: string): Boolean {
	return true
}

function validatePassword(password?: string): Boolean {
	return true
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789%!$*#@?a"
function generatePassword(length: number) {
    let password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}