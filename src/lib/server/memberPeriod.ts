import type { User } from "$gtypes"
import { sendMail } from "./mailClient"
import { db } from "./postgresClient"
import { readFile } from 'fs';
import type { Period } from "$lib/publicMemberPeriod";

function updateMemberPeriod(user: User, period: Period) {
	const now = new Date(Date.now())

	//Define if the member period already started
	const newRole = period.start && period.start! <= now ? "MEMBER" : "USER"

	db.none("UPDATE $[table:name] SET role=$[role], member_start=$[member_start], member_stop=$[member_stop] WHERE id=$[id]", {
		table: "users",
		member_start: newRole == "MEMBER" ? null : period.start,
		member_stop: period.stop,
		role: newRole,
		id: user.id
	})
	readFile('static/mails/updateMemberPeriod.html', function(err, data) {		
		let html = data.toString()
		if(period.start) html = html.replace('%START%', period.start?.toLocaleDateString())
		if(period.stop) html = html.replace('%STOP%', period.stop?.toLocaleDateString())
		sendMail(user.email, "JDRPoly: Vous êtes membres !", html)
	})
}

export { updateMemberPeriod }