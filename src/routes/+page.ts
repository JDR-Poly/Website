
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	return {
		events: 
		fetch('/api/events')
			.then((res) => {
				return (res.ok ? res.json() : []) as Event[];
			})
			.catch((err) => {
				return [] as Event[];
			})
	}
}