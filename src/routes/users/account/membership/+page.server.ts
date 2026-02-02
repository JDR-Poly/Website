/** @format */

import type { RequestEvent, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { updateMemberPeriod } from "$lib/server/memberPeriod";
import { Period } from "$lib/publicMemberPeriod";
import { Role, Roles } from "$lib/userPermissions";
import type { Id } from "$gtypes";
import { extend_membership } from "$lib/server/membership";
import pgPromise from "pg-promise";

type UserDb = {
	id: Id;
	member_start: string;
	member_stop: string;
	role: Role;
	email: string;
};
/**
 * For a user, validate a code and add the correspoding member time.
 * @param {number} request.validation_token the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export const actions = {
	default: async ({ request, locals }: RequestEvent) => {
		if (!locals.authenticated) throw error(401);
		const form = await request.formData();

		const token = form.get("validation_token");
		if (!locals.user) { throw error(500, { message: "user not found"}) }
		if (!locals.user.email) { throw error(500, "email missing in user found") }

		const user = {
			email: locals.user.email,
			...locals.user,
			role: Roles[locals.user.role.name],
		}

		const res = await db
			.any("SELECT validation_token, periods FROM members_code WHERE validation_token=$1", [
			token,
		]);

		if (res && res.length > 0) {
			const tokenResult = res[0]
			
			await db.none("DELETE FROM members_code WHERE validation_token=$1", [tokenResult.validation_token]); //Delete now invalid token

			//Calculate new member period
			let period = new Period(user?.member_start, user?.member_stop);
			period.addSemesters(tokenResult.periods);
			updateMemberPeriod({id: user.id, email: user.email, role: user.role}, period);

			return {
				success: true,
				message: "période membre étendue avec succés"
			}
		}

		return await db
			.one("SELECT id, validation_token, period, year FROM membership_code WHERE validation_token=$1", [
			token,
		])
			.then(async (res) => {
				return extend_membership(user.id, user.email, res.period, res.year, true)
					.then(async (period) => {
						await db.none("DELETE FROM membership_code WHERE id=$1", res.id); //Delete now invalid token
						return { success: true, period }
					})
					.catch((err) => {
						if (err.constraint && err.constraint === 'membership_pkey')
							return fail(409, { invalid: true, message: "Vous êtes déjà membre!" });
						throw error(500, err.message);
					});
			})
			.catch((err: pgPromise.errors.QueryResultError) => {
				return fail(404, { invalid: true, message: "Ce code n'est pas valide." })
			});
	},
} satisfies Actions;
