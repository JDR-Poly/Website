<script lang="ts">
	import { error } from "$lib/stores";

	const eventsPromise = fetch('/api/events')
		.then((res) => {
			return res.ok ? res.json() : []
		})
		.catch((err) => {
			$error = err.message
			return []
		})
</script>

{#await eventsPromise}
	<p>Chargement des événements futurs</p>
{:then events} 
	{#each events as event}
		<div>
			<h5><a href={"/events/" + event.id} >{event.title}</a></h5>
			<p>Date: {event.date}</p>
			<p>{event.description}</p>
		</div>
		
	{/each}
{/await}