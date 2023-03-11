import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	return {
		books: fetch('/api/books')
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				return _sortByItemOrder(res);
			})
	}
}

export function _sortByItemOrder(books: any) {
	return books.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
}