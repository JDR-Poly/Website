/** @format */

import type { RequestEvent } from "@sveltejs/kit";
import { global_settings } from "$lib/server/settings";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }: RequestEvent) {
	return {
		authenticated: locals.authenticated,
		user: locals.user,
		discord_link: global_settings.discord_link,
		telegram_link: global_settings.telegram_link,
	};
}
