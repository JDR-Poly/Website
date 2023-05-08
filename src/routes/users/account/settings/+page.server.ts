import { db } from '$lib/server/postgresClient';
import type { Actions } from './$types';
import { compare, hash } from "bcrypt";
import { fail } from '@sveltejs/kit';
import { sendMailValidationToken } from '$lib/server/mailClient';

export const actions = {
	/**
	 * Set a new password
	 * @param {string} request.newPassword
	 * @param {string} request.oldPassword
	 */
	updatePassword: async ({ request, locals }) => {
		if (!locals.authenticated) return fail(401, { message: "L'utilisateur n'est pas authentifié." })

		const form = await request.formData()
		const oldPassword = form.get('oldPassword')?.toString()
		const newPassword = form.get('newPassword')?.toString()

		if (!oldPassword || !newPassword) return fail(400, { message: "Paramètre manquant." })

		try {
			const password = await db.one(`SELECT password FROM users WHERE id=$1`,
				[locals.user?.id],
				a => a.password)

			if (!(await compare(oldPassword, password))) return fail(400, { message: "Mot de passe incorrect." })

			const newHashPassword = await hash(newPassword, 15)
			return await db.none(`UPDATE users SET password=$1 WHERE id=$2`, [newHashPassword, locals.user?.id])
				.then(() => {
					return { sucess: true }
				})
		} catch (err: any) {
			return fail(500, { message: err.message })
		}
	},
	/**
	 * Set a new name
	 * @param {string} request.name 
	 */
	updateName: async ({ request, locals }) => {
		if (!locals.authenticated) return fail(401, { message: "L'utilisateur n'est pas authentifié." })

		const form = await request.formData()
		const name = form.get('name')?.toString()

		if (!name) return fail(400, { message: "Paramètre manquant." })

		return await db.none(`UPDATE users SET name=$1 WHERE id=$2`, [name, locals.user?.id])
			.then(() => {
				return { sucess: true }
			})
			.catch((err) => {
				return fail(500, { message: err.message })
			})
	},
	/**
	 * Set a new email
	 * @param {string} request.email the new email of the user
	 * @param {string} request.password the password of the user
	 */
	updateEmail: async ({ request, locals, url }) => {
		if (!locals.authenticated) return fail(401, { message: "L'utilisateur n'est pas authentifié." })

		const form = await request.formData()
		const email = form.get('email')?.toString()
		const formPassword = form.get('password')?.toString()

		if (!email || !formPassword) return fail(400, { message: "Paramètre manquant." })

		try {
			const password = await db.one(`SELECT password FROM users WHERE id=$1`
				, [locals.user?.id], a => a.password
			)

			const isPasswordCorrect = await compare(formPassword, password)
			if (!isPasswordCorrect) return fail(400, { message: "Mot de passe incorrect." })

			//Send mail to validate their email
			sendMailValidationToken(locals.user!.id, email!, url.origin)

			return await db.none(`UPDATE users SET email=$1, is_email_validated=FALSE WHERE id=$2`, [email, locals.user?.id])
				.then(() => {
					return { sucess: true }
				})
		} catch (err: any) {
			return fail(500, { message: err.message })
		}
	},
	/**
	 * Delete account
	 * @param {string} request.password password of the user
	 */
	deleteAccount: async ({ request, locals }) => {
		if (!locals.authenticated) return fail(401, { message: "L'utilisateur n'est pas authentifié." })

		const form = await request.formData()
		const formPassword = form.get('password')?.toString()

		if (!formPassword) return fail(400, { message: "Paramètre manquant." })

		try {
			const password = await db.one(`SELECT password FROM users WHERE id=$1`
				, [locals.user?.id], a => a.password)

			const isPasswordCorrect = await compare(formPassword, password)
			if (!isPasswordCorrect) return fail(400, { message: "Mot de passe incorrect." })

			return await db.none(`DELETE FROM events WHERE author=$1; DELETE FROM users WHERE id=$1;`, [locals.user?.id])
				.then(() => {
					return { sucess: true }
				})
		} catch (err: any) {
			return fail(500, { message: err.message })
		}
	}
} satisfies Actions;