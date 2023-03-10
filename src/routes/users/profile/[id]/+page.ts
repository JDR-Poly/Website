import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	return {
		user_profile: 
		fetch(`/api/users/${params.id}`)
			.then(async (res) => {
				const body = await res.json()					
				if(!res.ok) throw error(res.status, body.message)			
				return body;
			})
			.catch((err) => {
				throw redirect(307, '/404');
			})
	}
}