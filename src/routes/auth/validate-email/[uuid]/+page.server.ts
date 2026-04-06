/** @format */

import { db } from "$lib/server/postgresClient";
import type { PageServerLoad } from "./$types";
import { AlreadyMemberError, InvalidMemberCodeError, MembershipError, validate_code } from "$lib/server/membership";
import type { Id } from "$gtypes";

/**
 * Tries to add the user as a member if there is a code sent to this mail waiting
 * @param email mail of user
 * @param user_id id of user
 * @returns true if added as member false otherwise
 */
async function validate_code_associated_with_mail(email: string, user_id: Id) {
	return await db.one("SELECT validation_token FROM membership_code WHERE email=$1", [email], (a) => a.validation_token)
		.then(async (code) => {
			return await validate_code(user_id, email, code)
				.then(() => true)
				.catch(() => false)
		})
		.catch(() => false)
}

export const load = (async ({ params }) => {
	const token = params.uuid;

	return db
		.one(`SELECT user_id, email FROM email_validation INNER JOIN users ON user_id = id WHERE validation_token=$1`, [token])
		.then((data) => {
			return db.none("UPDATE users SET is_email_validated=TRUE WHERE id=$1", [data.user_id]).then(async () => {
				db.none("DELETE FROM email_validation WHERE user_id=$1", [data.user_id]);
				const also_member = await validate_code_associated_with_mail(data.email, data.user_id);
				return {
					success: true,
					message: also_member ? "Code membre validé !" : null
				};
			});
		})
		.catch((err) => {
			return {
				success: false,
			};
		});
}) satisfies PageServerLoad;
