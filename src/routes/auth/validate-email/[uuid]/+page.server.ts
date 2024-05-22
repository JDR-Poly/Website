/** @format */

import { db } from "$lib/server/postgresClient";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
	const token = params.uuid;

	return db
		.one(`SELECT user_id FROM email_validation WHERE validation_token=$1`, [token], (a) => a.user_id)
		.then((id) => {
			return db.none("UPDATE users SET is_email_validated=TRUE WHERE id=$1", [id]).then((res) => {
				db.none("DELETE FROM email_validation WHERE user_id=$1", [id]);
				return {
					success: true,
				};
			});
		})
		.catch((err) => {
			return {
				success: false,
			};
		});
}) satisfies PageServerLoad;
