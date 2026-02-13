import type { Id, Semesters } from "$gtypes";
import { __envDir } from "$utils";
import { sendMail } from "./mailClient";
import { db } from "./postgresClient";
import { readFile } from "fs";
import { v4 as uuid } from "uuid";
import { global_settings } from "./settings";
import { schedule } from "node-cron";
import { logger } from "./logger";

export class MembershipError extends Error {};
export class AlreadyMemberError extends MembershipError {};
export class InvalidMemberCodeError extends MembershipError {};

/**
 * Send a membership code to an email
 * @param email email to send code to
 * @param code valid code
 */
export function send_membership_code(email: string, code: string) {
    readFile(__envDir + "mails/newMemberCode.html", function (err, data) {
		let html = data.toString();
		html = html.replaceAll("%CODE%", code);
		sendMail(email, "JDR-Poly: Tu es membre !", html);
	});
}

/**
 * If user with email exists, add membership directly, otherwise send a new code to given email
 * @param email email to send code or notification to
 * @param semesters semesters to add ('autumn' | 'spring' | 'all')
 * @param year year of membership
 */
export async function send_or_extend_membership(email: string, semesters: Semesters, year: number) {
const userResult = await db.any(
        "SELECT id FROM users WHERE email = $[email];",
        { email },
    );
    if (userResult && userResult.length > 0) {
        const user = userResult[0];

        return await extend_membership(user.id, email, semesters, year)
            .then((period) => {
                return { period };
            });
    }

    // Generate a random validation token
    const validation_token = uuid();

    let res = db.one(
            `INSERT INTO membership_code (validation_token, email, period, year, email_sent)
            VALUES ($[validation_token], $[email], $[semesters], $[year], CURRENT_TIMESTAMP)
            RETURNING id, email_sent;`,
            { validation_token, email: email, semesters: semesters, year: year },
        )
        .then((code) => {
            return { code };
        })
    send_membership_code(email, validation_token);
    return res;
}

/**
 * Add membership to a user for a given code. Notifies the user by email
 * @param user_id id of the user
 * @param email email to send notification to
 * @param code valid code
 */
export async function validate_code(user_id: Id, email: string, code: string) {
    return await db
        .one("SELECT id, validation_token, period, year FROM membership_code WHERE validation_token=$1", [
        code,
    ])
        .then(async (res) => {
            return extend_membership(user_id, email, res.period, res.year, true)
                .then(async (period) => {
                    await delete_code(res.id); //Delete now invalid code
                    return period
                });
        })
        .catch((err) => {
            if ( err instanceof MembershipError )
                throw err;
            else
                throw new InvalidMemberCodeError();
        });
}

/**
 * Delete a membership code
 * @param id id of the membership code
 */
export async function delete_code(id: Id) {
    await db.none("DELETE FROM membership_code WHERE id=$1", id);
}


/**
 * Add membership to a user for a given year and semester. Notifies the user by email
 * @param user_id id of the user
 * @param email email to send notification to
 * @param semesters semesters to add ('autumn' | 'spring' | 'all')
 * @param year year of membership
 * @param from_code is it obtained from a code or not
 * @returns 
 */
export async function extend_membership(
    user_id: Id, email: string, semesters: Semesters, year: number,
    from_code = false
) {

    await db.none(
        `INSERT INTO membership (user_id, period, year, from_code)
        VALUES ($[id], $[semesters], $[year], $[from_code])`,
        { id: user_id, semesters: semesters, year: year, from_code: from_code }
    )
        .catch((err) => {
            if (err.constraint && err.constraint === 'membership_pkey')
                throw new AlreadyMemberError();
            throw err;
        });

    const { member_start, member_stop } = await db.one(
        `SELECT member_start, member_stop FROM users_memberships_view
        WHERE id = $[id]`,
        { id: user_id, semesters: semesters, year: year }
    );
    
    readFile(__envDir + "mails/updateMemberPeriod.html", function (err, data) {
        let html = data.toString();
        const formater = new Intl.DateTimeFormat("fr-Fr", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Paris",
        });
        html = html.replace("%START%", formater.format(member_start));
        html = html.replace("%STOP%", formater.format(member_stop));
        sendMail(email, "JDR-Poly: Tu es membre !", html);
	});

    return { member_start, member_stop }
}

/** Delete expired membership codes */
schedule("0 1 * * *", () => {
	db.none(
        `DELETE FROM membership_code WHERE NOW() > (email_sent + ($[valid_days] * INTERVAL '1 DAY'))`,
        { valid_days: global_settings.code_validity_days }
    );
	logger.info(`Deleted membership codes that timed_out after ${global_settings.code_validity_days} days`);
});
