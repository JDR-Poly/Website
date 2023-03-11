import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	return {
		honormembers: 
			fetch('/api/honormembers')
				.then(async (res) => {
					const body = await res.json()					
					if(!res.ok) throw error(res.status, body.message)			
					return body;
				})
	}
}