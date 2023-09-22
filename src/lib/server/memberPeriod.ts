import type { Id } from "$gtypes"
import { sendMail } from "./mailClient"
import { db } from "./postgresClient"
import { readFile } from 'fs';
import type { Period } from "$lib/publicMemberPeriod";
import { __envDir } from "$lib/utils";
import { Role, Roles } from "$lib/userPermissions";
import { logger } from "./logger";

/**
 * Update the user member period in the database
 * Also take cares of changing the user role and
 * making sure the user is not an admin.
 * @param user the user to update the role of
 * @param period for which periods the user should be a member
 */
function updateMemberPeriod(user: { id: Id, email: string, role: Role }, period: Period) {
	if (user.role != Roles.USER && user.role != Roles.MEMBER) {
		logger.info(`Won't add member period for role ${user.role.name} for user with email : ${user.email}`)
		return
	}

	//Define if the member period already started
	const now = new Date(Date.now())
	const newRole = period.start && period.start! <= now ? "MEMBER" : "USER"

	db.none("UPDATE $[table:name] SET role=$[role], member_start=$[member_start], member_stop=$[member_stop] WHERE id=$[id]", {
		table: "users",
		member_start: period.start,
		member_stop: period.stop,
		role: newRole,
		id: user.id
	})
	readFile(__envDir + 'mails/updateMemberPeriod.html', function (err, data) {
		let html = data.toString()
		let formater = new Intl.DateTimeFormat('fr-Fr', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/Paris'
		})
		html = html.replace('%START%', formater.format(period.start))
		html = html.replace('%STOP%', formater.format(period.stop))
		sendMail(user.email, "JDRPoly: Tu es membre !", html)
	})
}

export { updateMemberPeriod }