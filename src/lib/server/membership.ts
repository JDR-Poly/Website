import type { Id, Semesters } from "$gtypes";
import { __envDir } from "$utils";
import type { Period } from "../publicMemberPeriod";
import { sendMail } from "./mailClient";
import { db } from "./postgresClient";
import { readFile } from "fs";

export function send_membership_code(email: string, code: string) {
    readFile(__envDir + "mails/newMemberCode.html", function (err, data) {
		let html = data.toString();
		html = html.replaceAll("%CODE%", code);
		sendMail(email, "JDR-Poly: Tu es membre !", html);
	});
}

export async function extend_membership(
    user_id: Id, email: string, semesters: Semesters, year: number,
    from_code = false
) {

    await db.none(
        `INSERT INTO membership (user_id, period, year, from_code)
        VALUES ($[id], $[semesters], $[year], $[from_code])`,
        { id: user_id, semesters: semesters, year: year, from_code: from_code }
    )

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
