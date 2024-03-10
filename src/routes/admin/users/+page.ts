/** @format */

import type { User } from "$gtypes";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
	const pageSize = 100
	return {
		users: await fetch(`/api/users/search?number=${pageSize + 1}&sort=desc`) //always request one more to know if it's the last page.
			.then(async (res) => {
				return (await res.json()) as User[] 
			}),
		pageSize: pageSize
	};
}) satisfies PageLoad;
