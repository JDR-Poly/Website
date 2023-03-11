import type { User } from "$gtypes"
import { sendMail } from "./mailClient"
import { db } from "./postgresClient"
import { readFile } from 'fs';

/**
 * Increse the end of the period to next closest period's end
 * without changing the period start (except if not existing)
 * @param {Period} period the period to increase
 * @returns {Period} the next period
 */
function getNextPeriod(period: Period): Period {
	let closestNextPeriod: Period = {}
	if (!period.stop) { period = { start: period.start, stop: new Date(Date.now()) } }

	periods.forEach(newPeriod => {
		if (newPeriod.stop) {
			if (newPeriod.stop > period.stop! && (!closestNextPeriod.stop || newPeriod.stop < closestNextPeriod.stop)) {
				closestNextPeriod = newPeriod
			}
		}
	})

	return {
		start: !period.start ? closestNextPeriod.start : period.start,
		stop: closestNextPeriod.stop ? closestNextPeriod.stop : period.stop
	}
}

type Period = {
	start?: Date,
	stop?: Date
}

const periods: Period[] = [
	{ start: new Date(2022, 8, 10), stop: new Date(2023, 0, 10) },
	{ start: new Date(2023, 0, 10), stop: new Date(2023, 6, 10) }
]

function updateMemberPeriod(user: User, period: Period) {
	const now = new Date(Date.now())

	//Define if the member period already started
	const newRole = period.start && period.start! <= now ? "MEMBER" : "USER"

	db.none("UPDATE $[table:name] SET role=$[role], member_start=$[member_start], member_stop=$[member_stop] WHERE id=$[id]", {
		table: "users",
		member_start: period.start,
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

export { type Period, getNextPeriod, updateMemberPeriod }