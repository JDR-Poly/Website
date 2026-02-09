/** @format */

import { db } from "$lib/server/postgresClient";
import { error, isHttpError, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { extend_membership } from "$lib/server/membership";

/**
 * Validate membership code
 * Adds membership based on code and consumes the code
 *
 * @param {string} code the code or validation token
 */
export const POST = (async ({ request, locals }) => {
    if (!locals.authenticated) throw error(401);

    if (!locals.user) { throw error(500, { message: "user not found"}) }
		if (!locals.user.email) { throw error(500, "email missing in user found") }

    const user = {
        email: locals.user.email,
        ...locals.user,
    }

    const data = await request.json();

	if (!data.code) {
		throw error(400, "Missing required field: code");
	}

    return await db
        .one("SELECT id, validation_token, period, year FROM membership_code WHERE validation_token=$1", [
        data.code,
    ])
        .then(async (res) => {
            return extend_membership(user.id, user.email, res.period, res.year, true)
                .then(async (period) => {
                    await db.none("DELETE FROM membership_code WHERE id=$1", res.id); //Delete now invalid token
                    return json({ success: true, period }, { status: 200 })
                })
                .catch((err) => {
                    if (err.constraint && err.constraint === 'membership_pkey')
                        throw error(409, "Vous êtes déjà membre!" );
                    throw error(500, err.message);
                });
        })
        .catch((err) => {
            if ( isHttpError(err) )
                throw err;
            else
                throw error(404, "Ce code n'est pas valide.");
        });

}) satisfies RequestHandler;
