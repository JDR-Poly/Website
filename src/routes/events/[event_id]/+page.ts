import { error, json, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	return {
		event: 
			fetch('/api/events/' + params.event_id)
				.then(async (res) => {
					const body = await res.json()					
					if(!res.ok) throw error(res.status, body.message)			
					return body;
				})
				.then(async (event) => {					
					return fetch('/api/events/' + params.event_id + '/subscribe')
						.then(async (subscribed_fetch) => {
							event.date = new Date(event.date)
							if(event.inscription_start) event.inscription_start = new Date(event.inscription_start)
							if(event.inscription_stop) event.inscription_stop = new Date(event.inscription_stop)
							event.subscribed = await subscribed_fetch.json()
							return event;
						})
				})
				.catch((err) => {					
					throw redirect(307, '/404');
				})
	}
}
