/** @format */

import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { HonorMember } from "$gtypes";

export const load = (async ({ fetch }) => {
	return {
		honormembers: fetch("/api/honormembers").then(async (res) => {
			const body = await res.json();
			if (!res.ok) throw error(res.status, body.message);
			return __sortByItemOrder(body) as HonorMember[];
		}),
	};
}) satisfies PageLoad;

export function __sortByItemOrder(members: HonorMember[]): HonorMember[] {
	return members.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
}
