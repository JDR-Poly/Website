/** @format */

import type { User } from "$gtypes";
import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, params }) => {
	return {
		profile: fetch(`/api/users/${params.id}`)
			.then(async (res) => {
				const body = await res.json();
				if (!res.ok) throw error(res.status, body.message);
				return body as User;
			})
			.catch((err) => {
				throw redirect(307, "/404");
			}),
	};
}) satisfies PageLoad;
