/** @format */

import { db } from "$lib/server/postgresClient";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { AlreadyMemberError, InvalidMemberCodeError, MembershipError, validate_code } from "$lib/server/membership";

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

    const data = await request.json();

	if (!data.code) {
		throw error(400, "Missing required field: code");
	}

    return await validate_code(locals.user.id, locals.user.email, data.code)
        .then((period) => {
            return json({period, success: true});
        })
        .catch((err) => {
            switch (err.constructor) {
                case AlreadyMemberError:
                    throw error(409, "Vous êtes déjà membre");
                case InvalidMemberCodeError:
                    throw error(404, "Ce code n'est pas valide");
                default:
                    throw error(500);
            }
        })

}) satisfies RequestHandler;
