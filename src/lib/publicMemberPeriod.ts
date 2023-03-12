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
	{ start: new Date(2023, 0, 10), stop: new Date(2023, 6, 10) },
	{ start: new Date(2024, 8, 10), stop: new Date(2024, 0, 10) },
	{ start: new Date(2024, 0, 10), stop: new Date(2024, 6, 10) }
]

export { type Period, getNextPeriod}