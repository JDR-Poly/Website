<script lang="ts">
	import { error } from '$lib/stores';
	import { page } from '$app/stores';
	import { redirect } from '@sveltejs/kit';
	import { hasRolePermission, Role, Roles, UserPermission } from '$lib/userPermissions';
	import { goto } from '$app/navigation';

	const { id } = $page.params;

	const eventPromise = fetch('/api/events/' + id)
		.then(async (res) => {
			const body = await res.json();
			console.log(body);

			return body;
		})
		.catch((err) => {
			$error = err.message;
			throw redirect(403, '/not-found');
		});

	function translateRole(role?: Role) {
		if (!role?.name) return 'ERROR';
		switch (role.name) {
			case Roles.USER.name:
				return 'un utilisateur';
				break;
			case Roles.MEMBER.name:
				return 'un membre';
				break;
			case Roles.COMMITTEE.name:
				return 'un membre du comité';
				break;
			default:
				return 'ERROR';
				break;
		}
	}

	async function deleteEvent(id: number) {
		const res = await fetch('/api/events/' + id, {
			method: 'DELETE'
		});
		if (res.ok) {
			goto("/events")	
		} else {
			const body = await res.json();
			$error = body.message
		}
	}
</script>

{#await eventPromise}
	<p>Chargement de l'événement</p>
{:then event}
	<h3>{event.title}</h3>
	<p>Date: {event.date}</p>
	<p>{event.description}</p>

	{#if event.inscription}
		{#if $page.data.authenticated && hasRolePermission('JOIN_EVENT_' + event.inscription_group.toUpperCase(), $page.data?.user?.role)}
			<button>S'inscrire //TODO</button>
		{:else}
			<p color="red">
				Vous devez être {translateRole(Roles[event.inscription_group])} pour pouvoir vous inscrire à
				cette événement
			</p>
		{/if}
	{:else}
		<p color="green">Il n'y a pas besoin de s'inscrire pour cette événements</p>
	{/if}

	{#if hasRolePermission(UserPermission.MODIFY_EVENT) || event.author === $page.data.user?.id}
		<button color="red" on:click={() => deleteEvent(event.id)}>Supprimer</button>
	{/if}
{/await}
