<script lang="ts">
	import { error, warning, info } from '$lib/stores';
	import { page } from '$app/stores';
	import { hasRolePermission, Role, Roles, UserPermission } from '$lib/userPermissions';
	import { goto } from '$app/navigation';
	import { error as messageError } from '$lib/stores';
	import Button, { Label, Icon } from '@smui/button';
	import type { User } from '$gtypes';
	import Edit from './Edit.svelte';
	import { writable } from 'svelte/store';
	import ImageB64 from '$components/ImageB64.svelte';
	import type { PageData } from './$types';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';
	import IconButton from '$components/IconButton.svelte';

	export let data: PageData;

	let openDeleteConfirmDialog = false
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
				location.reload();
			})
			.catch((err) => {
				$messageError = err.message;
			});
	}

	async function unsubscribe() {
		fetch('/api/events/' + event_id + '/subscribe', {
			method: 'DELETE'
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$messageError = err.message;
			});
	}

	function eventHasUser(): Boolean {
		return data.subscribed.map((v) => v.id).includes($page.data.user?.id);
	}

	function copyMails() {
		const mails = data.subscribed.flatMap((v) => `${v.email}, `);
		const text = ''.concat(...mails).slice(0, -2);
		navigator.clipboard.writeText(text);
		$info = 'Les emails ont été copiés.';
	}

	let searchUserToAdd = '';
	let usersResult: User[] = [];
	/**
	 * Handle when the user write text in the searchBar
	 * to add possible result as completion
	 */
	async function inputChange() {
		if (searchUserToAdd.length < 3) {
			usersResult = [];
			return;
		}
		usersResult = (await search(3, 0)) || [];
	}

	/**
	 * Fetch a certain numbers of users
	 * (with a possible offset)
	 * @param number how many users to search for
	 * @param index offset of the index
	 */
	async function search(number: number, index: number): Promise<User[]> {
		try {
			let userListURL = new URL($page.url.origin + '/api/users/search');
			userListURL.searchParams.append('number', number as any);
			userListURL.searchParams.append('index', index as any);
			userListURL.searchParams.append('searchText', searchUserToAdd);

			return fetch(userListURL).then(async (res) => {
				const body = await res.json();
				if (res.ok && body.length > 0) {
					return body;
				} else if (!res.ok) {
					$error = body.message;
					return [];
				}
			});
		} catch (err) {
			console.error(err);
			$error = 'An error occured';
			return [];
		}
	}

	const canSeeProfile = hasRolePermission(UserPermission.SEE_USERS_PROFILE, $page.data.user?.role);
	const dateFormater = new Intl.DateTimeFormat('fr-Fr', {
				dateStyle: 'medium',
				timeStyle: 'short',
				timeZone: 'Europe/Paris'
			})
</script>

<svelte:head>
	<title>{data.event.title} | JDRPoly</title>
</svelte:head>

<main>
	<div id="img" />
	<div id="wrapper">
		{#if data.event.imageb64}
			<ImageB64 imageb64={data.event.imageb64} alt="Événement" alternativeImageSrc="" />
		{/if}
		<h2>{data.event.title}</h2>
		<h3>
			{dateFormater.format(Date.parse(data.event.date))}
		</h3>

		<div id="split">
			<p id="description">
				<!-- {data.event.description ? data.event.description.replaceAll('\n', '\n\n') : ''} -->
				{data.event.description}
			</p>
			<div id="inscription">
				{#if data.event.inscription}
					{#if $page.data.authenticated && hasRolePermission('JOIN_EVENT_' + data.event.inscription_group.toUpperCase(), $page.data?.user?.role)}
						{#if !data.event.inscription_limit || data.subscribed.length < data.event.inscription_limit}
							{#if (!data.event.inscription_start || Date.now() >= Date.parse(data.event.inscription_start)) && (!data.event.inscription_stop || Date.now() < Date.parse(data.event.inscription_stop))}
								{#if eventHasUser()}
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
								<p>Les inscriptions ne sont pas ouvertes.</p>
								{#if data.event.inscription_start && Date.now() < Date.parse(data.event.inscription_start) }
									<p>Ouverture des inscriptions le {dateFormater.format(Date.parse(data.event.inscription_start))}</p>
								{/if}
							{/if}
						{:else}
							<p>L'événement est complet.</p>
						{/if}
					{:else}
						<p class="inscriptionInfo" style="color: darkred;">
							Vous devez être {translateRole(Roles[data.event.inscription_group])} pour pouvoir vous
							inscrire à cette événement
						</p>
					{/if}
					<h5>
						Joueurs participants ({data.subscribed.length}{data.event.inscription_limit
							? `/${data.event.inscription_limit}`
							: ''}) :
					</h5>
					{#each data.subscribed as user}
						<div class="positioner">
							{#if canSeeProfile}
								<a href="/users/profile/{user.id}">{user.name}</a>
							{:else}
								<p>{user.name}</p>
							{/if}

							{#if hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, $page.data.user?.role)}
								<IconButton icon="material-symbols:close"
								action={() => {
									let urlForceDeleteSubscribedUser = new URL($page.url.origin + '/api/admin/events/' + event_id + '/subscribe')
									urlForceDeleteSubscribedUser.searchParams.append("userId", user.id.toString())
									fetch(urlForceDeleteSubscribedUser, {
										method: 'DELETE',
									})
										.then(() => {
											location.reload();
										})
										.catch((err) => {
											$messageError = err.message;
										});
								}}
								label={`Supprimer l'utilisateur ${user.name} de l'événement`}
								/>
							{/if}
						</div>
					{/each}
					{#if hasRolePermission(UserPermission.SUBSCRIBE_USER_TO_EVENT, $page.data.user?.role)}
						<div
							id="addUser"
							on:focusout={(event) => {
								setTimeout(() => {
									usersResult = [];
								}, 500);
							}}
						>
							<input
								type="text"
								placeholder="Utilisateur à ajouter"
								bind:value={searchUserToAdd}
								on:input={inputChange}
							/>
							<div class="searchBar-items">
								{#each usersResult as result}
									<button
										on:click={() => {
											let urlForceAddUser = new URL($page.url.origin + '/api/admin/events/' + event_id + '/subscribe')
											urlForceAddUser.searchParams.append("userId", result.id.toString())
											fetch(urlForceAddUser, {
												method: 'POST',
											})
												.then(async (res) => {
													if (!res.ok) {
														const body = await res.json();
														$warning = body.message.includes('duplicate key value violates')
															? 'Cette utilisateur est déjà dans la liste'
															: body.message;
													} else {
														location.reload();
													}
												})
												.catch((err) => {
													$error = err.message;
												});
										}}><strong>{result.name}</strong></button
									>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<p class="inscriptionInfo" style="color: green;">
						Il n'y a pas besoin de s'inscrire pour cet événement
					</p>
				{/if}
			</div>
		</div>
		{#if hasRolePermission(UserPermission.MODIFY_EVENT, $page.data.user?.role)}
			<div class="admin-btn" style="right: 60px;">
				<IconButton icon="material-symbols:delete-outline" action={() => (openDeleteConfirmDialog = true)} label={`Supprimer l'événement ${data.event.title}`}/>
			</div>
			<div class="admin-btn" style="right: 120px;">
				<IconButton icon="material-symbols:edit" action={() => openEditDialog.set(true)} label="Supprimer l'événement" />
			</div>
			{#if hasRolePermission(UserPermission.SEE_MAIL, $page.data.user?.role)}
				<div class="admin-btn" style="right: 180px;">
					<IconButton icon="material-symbols:mark-email-read" action={copyMails} label="Copier le mail des participants"/>
				</div>
			{/if}
			<Edit event={data.event} open={openEditDialog} />

			<Dialog open={openDeleteConfirmDialog}>
				<Title id="simple-title">Supprimer ?</Title>
				<Content id="simple-content">Êtes vous sûr de vouloir supprimer cet événement?</Content>
				<Actions>
					<Button on:click={() => {openDeleteConfirmDialog = false}}>
					<Label>Non</Label>
					</Button>
					<Button on:click={() => {
						openDeleteConfirmDialog = false
						deleteEvent(data.event.id)
						}}>
					<Label>Oui</Label>
					</Button>
				</Actions>
			</Dialog>
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
			background: url('/images/events/banner.webp') center/cover;
			aspect-ratio: 16/9;
			position: absolute;
			height: 100%;
			width: 100%;
		}

		.admin-btn {
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
				width: 65%;
				font-size: 20px;
				letter-spacing: 1px;
				line-height: 1.25em;
				text-align: justify;
			}
			#inscription {
				width: 35%;
				text-align: center;
				margin-left: 2.5em;
				:global(.mdc-button) {
					width: 60%;
					margin: 1em;
				}
				.inscriptionInfo {
					border-bottom: 2px solid lightgrey;
					margin-bottom: 1em;
					padding: 0.2em;
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

				a,
				p {
					font-size: 20px;
					color: #666;
					text-decoration: none;
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
					margin: 2em 20% 0 20%;
					:global(.mdc-text-field) {
						float: left;
					}

					input {
						width: 100%;
						padding: 5px;
						box-sizing: border-box;
					}

					button {
						width: 100%;
						border: none;
						padding: 0.5em 0 0.5em 0;
						background-color: $secondary;
						text-decoration: underline;

						&:hover {
							background-color: lightgray;
						}
					}
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		#split {
			flex-direction: column;

			& > * {
				width: 100% !important;
				margin-bottom: 3em;
				margin-left: 0 !important;
			}
		}
	}
</style>
