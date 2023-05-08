/**
 * A period represent the time between which 
 * a user is a member.
 */
class Period {
	start: Date
	stop: Date
	/**
	 * Create a period from dates or UTC Date string
	 * or undefined
	 * @param start when the period start 
	 * @param stop when the period end
	 */
	constructor(start?: Date | string, stop?: Date | string) {
		const now = Date.now()
		if(start && typeof start == 'string') start = new Date(Date.parse(start))
		if(stop && typeof stop == 'string') stop = new Date(Date.parse(stop))

		this.start = start ? start as Date : new Date(now)
		this.stop = stop ? stop as Date : new Date(now)
	}

	/**
	 * Increase the end of the period to next closest period's end
	 * without changing the period start.
	 * @param {number} semesters how many semesters to add
	 * @returns {Period} this
	 */
	addSemesters(semesters: number): Period {
		for (let i = 0; i < semesters; i++) {
			if (this.stop.getMonth() <= 6) {
				this.stop.setMonth(8)
				this.stop.setDate(0)
			} else {
				this.stop.setMonth(0)
				this.stop.setDate(30)
				this.stop.setFullYear(this.stop.getFullYear() + 1)
			}
		}
		return this
	}

	/**
	 * Do a deep clone of the object
	 */
	clone(): Period {
		return new Period(new Date(this.start.getTime()), new Date(this.stop.getTime()));	
	}
}

export { Period }