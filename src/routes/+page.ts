import type { Event } from '$gtypes';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	return {
		events: fetch('/api/events')
			.then(async (res) => {
				return (res.ok ? await res.json() : []) as Event[];
			})
			.then((res) => {
				if(res.length > 3) res.splice(3, res.length - 3)
				return res
			})
			.catch((err) => {
				return [] as Event[];
			})
	}
}) satisfies PageLoad;