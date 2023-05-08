import type { Id, User } from "$gtypes"
import { sendMail } from "./mailClient"
import { db } from "./postgresClient"
import { readFile } from 'fs';
import type { Period } from "$lib/publicMemberPeriod";
import { __envDir } from "$lib/utils";
import { Role, Roles } from "$lib/userPermissions";

/**
 * Update the user member period in the database
 * Also take cares of changing the user role and
 * making sure the user is not an admin.
 * @param user the user to update the role of
 * @param period for which periods the user should be a member
 */
function updateMemberPeriod(user: { id: Id, email: string, role: Role }, period: Period) {
	if (user.role != Roles.USER && user.role != Roles.MEMBER) return

	//Define if the member period already started
	const now = new Date(Date.now())
	const newRole = period.start && period.start! <= now ? "MEMBER" : "USER"

	db.none("UPDATE $[table:name] SET role=$[role], member_start=$[member_start], member_stop=$[member_stop] WHERE id=$[id]", {
		table: "users",
		member_start: newRole == "MEMBER" ? null : period.start,
		member_stop: period.stop,
		role: newRole,
		id: user.id
	})
	readFile(__envDir + 'mails/updateMemberPeriod.html', function (err, data) {
		let html = data.toString()
		if (period.start) html = html.replace('%START%', period.start?.toLocaleDateString())
		if (period.stop) html = html.replace('%STOP%', period.stop?.toLocaleDateString())
		sendMail(user.email, "JDRPoly: Vous êtes membres !", html)
	})
}

export { updateMemberPeriod }