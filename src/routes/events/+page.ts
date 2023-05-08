import type { Event } from '$gtypes';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	return {
		events:
			fetch('/api/events')
				.then((res) => {
					return (res.ok ? res.json() : []) as Event[];
				})
				.catch((err) => {
					return [] as Event[];
				})
	}
}) satisfies PageLoad;
