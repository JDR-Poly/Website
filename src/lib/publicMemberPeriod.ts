/** @format */

import type { DateString, Semesters } from "$gtypes";

/**
 * A period represent the time between which
 * a user is a member.
 */
class Period {
	start: Date;
	stop: Date;
	/**
	 * Create a period from dates or Local Date string
	 * or undefined
	 * @param start when the period start
	 * @param stop when the period end
	 */
	constructor(start?: Date | DateString, stop?: Date | DateString) {
		const now = Date.now();
		if (start && typeof start == "string") start = new Date(Date.parse(start));
		if (stop && typeof stop == "string") stop = new Date(Date.parse(stop));

		this.start = start ? (start as Date) : new Date(now);
		this.stop = stop ? (stop as Date) : new Date(now);
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
				this.stop.setMonth(8);
				this.stop.setDate(0);
			} else {
				this.stop.setMonth(0);
				this.stop.setDate(30);
				this.stop.setFullYear(this.stop.getFullYear() + 1);
			}
		}
		return this;
	}

	overlaps(period: Period): boolean {
		if (this.stop < period.start || period.stop < this.start)
			return false;
		return true;
	}

	combineWith(period: Period): Period {
		this.start = new Date(Math.min(this.start.getTime(), period.start.getTime()));
		this.stop = new Date(Math.max(this.stop.getTime(), period.stop.getTime()));
		return this;
	}

	/**
	 * Do a deep clone of the object
	 */
	clone(): Period {
		return new Period(new Date(this.start.getTime()), new Date(this.stop.getTime()));
	}
}

export function periodFromYearSemesters(year: number, semesters: Semesters): Period {
	const start = semesters === 'spring' ? new Date((year+1), 0, 0) : new Date(year, 7, 0);
	const stop = semesters === 'autumn' ? new Date((year+1), 0, 30) : new Date((year+1), 8, 0);
	return new Period(start, stop);
}

export { Period };
