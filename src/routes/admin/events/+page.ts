import type { Event } from '$gtypes';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	return { 
		events: fetch('/api/events?excludeExpiredEvents=false')
			.then(async (res) => {
				return res.json()
			}).then((events) => {
				events.forEach((event: any) => {
					event.date = new Date(Date.parse(event.date))
				});
				return events
			}).then((events: Event[]) => {
				return events.sort((a, b) => {
					if(a.date < b.date) return -1 
					else if(a.date.getTime()==b.date.getTime()) return 0
					else return 1
				}).reverse()
			})
	};
}) satisfies PageLoad;