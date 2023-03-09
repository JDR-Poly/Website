import { error, json, redirect } from '@sveltejs/kit';
import type { Event } from '$gtypes';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	return {
		events: 
		fetch('/api/events')
			.then((res) => {
				return (res.ok ? res.json() : []) as Event[];
			})
			.then((res) => {
				return res.map((event) => {
					event.date = new Date(Date.parse(event.date as any));
					return event;
				});
			})
			.catch((err) => {
				return [] as Event[];
			})
	}
}
