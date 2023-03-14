<script lang="ts">
	import { error, warning } from '$lib/stores';
	import { page } from '$app/stores';
	import { hasRolePermission, Role, Roles, UserPermission } from '$lib/userPermissions';
	import { goto } from '$app/navigation';
	import {error as messageError} from "$lib/stores"
	import IconButton from '@smui/icon-button';
	import Button, { Label, Icon } from '@smui/button';
	import Textfield from '@smui/textfield';
	import type { User } from '$gtypes';
	import Edit from './Edit.svelte';
	import { writable } from 'svelte/store';
	import ImageB64 from '$components/ImageB64.svelte';

	export let data: any;
	
	const openEditDialog = writable(false);
	const { event_id } = $page.params;

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

	let addedUser = ''

	const canSeeProfile = hasRolePermission(UserPermission.SEE_USERS_PROFILE, $page.data.user?.role)
</script>
<svelte:head>
	<title>{data.event.title} | JDRPoly</title> 
</svelte:head>
<main>
	<div id="img"/>
	
	<div id="wrapper">
		{#if data.event.imageb64}
			<ImageB64 imageb64={data.event.imageb64} alt="Événement" alternativeImageSrc=""/>
		{/if}
		<h2>{data.event.title}</h2>
		<h3>{new Intl.DateTimeFormat('fr-Fr', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/Paris'
		}).format(data.event.date)}</h3>

		<div id="split">
			<p id="description">{data.event.description.replace("\n", "\n\n")}</p>
			<div id="inscription">
				{#if data.event.inscription}
					{#if $page.data.authenticated && hasRolePermission('JOIN_EVENT_' + data.event.inscription_group.toUpperCase(), $page.data?.user?.role)}
						{#if eventHasUser(data.event.subscribed)}
							<Button on:click={() => unsubscribe()} variant="raised">
								<Icon class="material-icons">person_remove</Icon>
								<Label>Se désinscrire</Label>
							</Button>
						{:else}
							<Button on:click={() => subscribe()} variant="raised">
								<Icon class="material-icons">person_add</Icon>
								<Label>M'inscrire</Label>
							</Button>
						{/if}
					{:else}
						<p color="red">
							Vous devez être {translateRole(Roles[data.event.inscription_group])} pour pouvoir vous inscrire à cette événement
						</p>
					{/if}
			
					<h5>Joueurs participants :</h5>
					<p>Il y a actuellement {data.event.subscribed.length} joueurs inscrits</p>
					{#each data.event.subscribed as user}
						<div class="positioner">
							{#if canSeeProfile}
								<a href="/users/profile/{user.id}">{user.name}</a>
							{:else}
								<a href="">{user.name}</a>
							{/if}

							{#if hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, $page.data.user?.role)}
								<IconButton class="material-icons" on:click={() => {
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
								}}>close</IconButton>
							{/if}
						</div>
					{/each}
					{#if hasRolePermission(UserPermission.SUBSCRIBE_USER_TO_EVENT, $page.data.user?.role)}
						<div id="addUser">
							<Textfield type="number" bind:value={addedUser} label="Id d'utilisateur" style="width: 50%"/>
							<IconButton class="material-icons" on:click={() => {
								fetch('/api/admin/events/' + event_id + '/subscribe', {
									method: 'POST',
									body: JSON.stringify({
										user_id: parseInt(addedUser)
									})
								}).then(async (res) => {
									if(!res.ok) {
										const body = await res.json()
										$warning = body.message.includes("duplicate key value violates") ? "Cette utilisateur est déjà dans la liste" : body.message

									} else {
										location.reload()
									}
								}).catch((err) => {
									$error = err.message
								})	
							}}>done</IconButton>
						</div>
					{/if}
				{:else}
					<p color="green">Il n'y a pas besoin de s'inscrire pour cette événements</p>
				{/if}
			</div>
		</div>
		{#if hasRolePermission(UserPermission.MODIFY_EVENT) || data.event.author === $page.data.user?.id}
			<div class="delete-btn">
				<IconButton class="material-icons" on:click={() => deleteEvent(data.event.id)}>close</IconButton>
			</div>
			<div id="edit-event">
				<IconButton
						class="material-icons"
						on:click={() => openEditDialog.set(true)}>
						edit
				</IconButton>
			</div>
			<Edit event={data.event} open={openEditDialog}></Edit>
		{/if}

	</div>
</main>

<style lang="scss">
	main {
		min-height: 90vh;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		padding: 45px 15px;

		#img {
			filter: blur(3px);
			background: url('/images/events/banner.png') center/cover;
			aspect-ratio: 16/9;
			position: absolute;
			height: 100%;
			width: 100%;
		}

		#edit-event {
			position: absolute;
			top: 20px;
			right: 60px;
		}
	}

	#wrapper {
		width: 1100px;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		padding: 40px 55px 90px;
		z-index: 1;
		position: relative;


		h2 {
			font-size: 1.65em;
			font-weight: 400;
			letter-spacing: 4px;
			margin: 0 0 0.5em 0;
			line-height: 1.75em;
		}
		
		h3 {
			font-weight: 400;
			letter-spacing: 2px;
			margin-bottom: 2em;
		}
		h5 {
			font-weight: 400;
			letter-spacing: 2px;
			margin-bottom: 2em;
		}

		:global(img) {
			max-height: 45vh;
			margin: 2em auto;
			display: block;
			object-fit: cover;
			width: 100%;
		}

		#split {
			display: flex;
			color: gray;
			#description {
				display: block;
				width: 60%;
				font-family: 'Ubuntu';
				font-size: 20px;
				letter-spacing: 1px;
				line-height: 1.25em;
				text-align: justify;
			}
			#inscription {
				width: 40%;
				text-align: center;
				:global(.mdc-button) {
					width: 60%;
				}
				h5 {
					font-size: 1.25em;
					font-weight: 400;
					letter-spacing: 3px;
					margin: 1em 0 0.75em 0;
					line-height: 1.75em;
				}
				p {
					text-align: center;
					width: 100%;
					margin-bottom: 10px;
				}

				a {
					font-size: 20px;
					color: #666;
					text-decoration: none;
					border-bottom: solid 1px #ddd;
				}
				.positioner {
					position: relative;
					margin: 10px 0;

					:global(.mdc-icon-button) {
						position: absolute;
						right: 10%;
						transform: translateY(-25%);
					}
				}
				#addUser {
					position: relative;
					margin: 2em 0 0 20%;
					:global(.mdc-text-field) {
						float: left;

					}

				}
				
			}
		}

		.delete-btn {
			position: absolute;
			top: 20px;
			right: 10px;
		}
	}
</style>