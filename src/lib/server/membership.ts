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

async function extend_membership_from_code(id: Id, code: string) {

}
