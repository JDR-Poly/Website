/** @format */

import type { Event, User } from "$gtypes";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
	return {
		users: fetch("/api/users/search?number=100")
			.then(async (res) => {
				return res.json();
			})
			.then((events: User[]) => {
				return events.sort((a, b) => {
					if (a.id > b.id) return -1;
					else if (a.id == b.id) return 0;
					else return 1;
				});
			}),
	};
}) satisfies PageLoad;
