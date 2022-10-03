<script lang="ts">
	import { error, warning } from "$lib/stores";
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { goto } from "$app/navigation";

	const eventsPromise = fetch('/api/events')
		.then((res) => {
			return res.ok ? res.json() : []
		})
		.catch((err) => {
			$error = err.message
			return []
		})

	async function deleteEvent(id: number) {
		const res = await fetch('/api/events/' + id, {
			method: 'DELETE'
		});
		if (res.ok) {
			location.reload()			
		} else {
			const body = await res.json();
			$error = body.message
		}
	}
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
			{#if hasRolePermission(UserPermission.MODIFY_EVENT, $page.data.user?.role)}
				<button on:click={() => deleteEvent(event.id)}>Supprimer</button>
			{/if}
		</div>
	{/each}
{/await}

