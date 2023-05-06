
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	return {
		events: 
		fetch('/api/events')
			.then((res) => {
				return (res.ok ? res.json() : []) as Event[];
			})
			.then((res) => {
				if(res.length > 3) res.splice(3, res.length - 3)
				return res
			})
			.catch((err) => {
				return [] as Event[];
			})
	}
}