<script lang="ts">
	import { error } from "$lib/stores";
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";

	const eventsPromise = fetch('/api/events')
		.then((res) => {
			return res.ok ? res.json() : []
		})
		.catch((err) => {
			$error = err.message
			return []
		})
</script>

{#if hasRolePermission(UserPermission.CREATE_EVENT, $page.data.user?.role)}
	<a href="/events/create">Créer un évènement</a>
{/if}
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

