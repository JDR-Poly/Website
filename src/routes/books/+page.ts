/** @format */

import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";
import type { Book } from "$gtypes";

export const load = (async ({ fetch }) => {
	return {
		books: fetch("/api/books")
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				return __sortByItemOrder(res) as Book[];
			}),
	};
}) satisfies PageLoad;

export function __sortByItemOrder(books: Book[]) {
	return books.sort((a, b) => (a.item_order >= b.item_order ? 1 : -1));
}
