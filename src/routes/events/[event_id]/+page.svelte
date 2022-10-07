<script lang="ts">
	import { error } from '$lib/stores';
	import { page } from '$app/stores';
	import { redirect } from '@sveltejs/kit';
	import { hasRolePermission, Role, Roles, UserPermission } from '$lib/userPermissions';
	import { goto } from '$app/navigation';
	import {error as messageError} from "$lib/stores"
	import type { User } from 'src/types';

	const { event_id } = $page.params;

	const eventPromise = fetch('/api/events/' + event_id)
		.then((res) => {
			return res.json();
		})
		.then(async (event) => {
			return fetch('/api/events/' + event_id + '/subscribe')
				.then((subscribed_fetch) => {
					return subscribed_fetch.json();
				})
				.then((subscribed) => {
					event.subscribed = subscribed;
					return event;
				});
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
			case Roles.MEMBER.name:
				return 'un membre';
			case Roles.COMMITTEE.name:
				return 'un membre du comité';
			default:
				return 'ERROR';
		}
	}

	async function deleteEvent(id: number) {
		const res = await fetch('/api/events/' + id, {
			method: 'DELETE'
		});
		if (res.ok) {
			goto('/events');
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	async function subscribe() {
		fetch('/api/events/' + event_id + '/subscribe', {
			method: 'POST'
		})
		.then(() => {
			location.reload()
		})
		.catch((err) => {
			$messageError = err.message
		})
	}

	async function unsubscribe() {
		fetch('/api/events/' + event_id + '/subscribe', {
			method: 'DELETE'
		})
		.then(() => {
			location.reload()
		})
		.catch((err) => {
			$messageError = err.message
		})
	}

	function eventHasUser(subscribed: User[]): Boolean {
		return subscribed.map(v => v.id).includes($page.data.user?.id)
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
			{#if eventHasUser(event.subscribed)}
				<button on:click={() => unsubscribe()}>Se désinscrire</button>
			{:else}
				<button on:click={() => subscribe()}>S'inscrire</button>
			{/if}
		{:else}
			<p color="red">
				Vous devez être {translateRole(Roles[event.inscription_group])} pour pouvoir vous inscrire à
				cette événement
			</p>
		{/if}

		<h5>Inscrits :</h5>
		{#each event.subscribed as user}
			<div>
				<p>{user.name}</p>
				{#if hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, $page.data.user?.role)}
					<button on:click={() => {
						fetch('/api/admin/events/' + event_id + '/subscribe', {
							method: 'DELETE',
							body: JSON.stringify({
								user_id: user.id
							})
						}).then(() => {
							location.reload()
						}).catch((err) => {
							$messageError = err.message
						})
					}}>X</button>
				{/if}
			</div>
		{/each}
	{:else}
		<p color="green">Il n'y a pas besoin de s'inscrire pour cette événements</p>
	{/if}

	{#if hasRolePermission(UserPermission.MODIFY_EVENT) || event.author === $page.data.user?.id}
		<button color="red" on:click={() => deleteEvent(event.id)}>Supprimer</button>
	{/if}
{/await}
