/** @format */

import type { Event } from "$gtypes";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
	return {
		events: fetch("/api/events?excludeExpiredEvents=false&noImage=true")
			.then(async (res) => {
				return res.json();
			})
			.then((events) => {
				events.forEach((event: any) => {
					event.date = new Date(Date.parse(event.date));
				});
				return events;
			})
			.then((events: Event[]) => {
				return events
					.sort((a, b) => {
						const eventADate = new Date(Date.parse(a.date));
						const eventBDate = new Date(Date.parse(b.date));

						if (eventADate < eventBDate) return -1;
						else if (eventADate.getTime() == eventBDate.getTime()) return 0;
						else return 1;
					})
					.reverse();
			}),
	};
}) satisfies PageLoad;
