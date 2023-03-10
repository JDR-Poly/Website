import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	return {
		categories: 
			fetch('/api/committee/categories')
				.then(async (res) => {
					const body = await res.json()					
					if(!res.ok) throw error(res.status, body.message)			
					return body.categories;
				})
	}
}