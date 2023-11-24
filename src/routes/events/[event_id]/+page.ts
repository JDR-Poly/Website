/** @format */

import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Event, Id } from "$gtypes";

export const load = (async ({ params, fetch }) => {
	return {
		event: fetch(`/api/events/${params.event_id}`)
			.then(async (res) => {
				const body = await res.json();
				if (!res.ok) throw error(res.status, body.message);
				return body as Event;
			})
			.catch((err) => {
				throw redirect(307, "/404");
			}),
		subscribed: fetch(`/api/events/${params.event_id}/subscribe`).then(async (res) => {
			return res.json() as Promise<[{ id: Id; name: string; email?: string }]>;
		}),
	};
}) satisfies PageLoad;
