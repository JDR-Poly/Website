<!-- @format -->
<script lang="ts">
	import { error, warning, info } from "$lib/stores";
	import { page } from "$app/stores";
	import { hasRolePermission, Role, Roles, UserPermission } from "$lib/userPermissions";
	import { goto } from "$app/navigation";
	import { error as messageError } from "$lib/stores";
	import type { User } from "$gtypes";
	import Edit from "./Edit.svelte";
	import { writable } from "svelte/store";
	import ImageB64 from "$components/ImageB64.svelte";
	import type { PageData } from "./$types";
	import IconButton from "$components/IconButton.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import Button from "$components/ui/button/button.svelte";


	export let data: PageData;

	let openDeleteConfirmDialog = writable(false);
	const openEditDialog = writable(false);
	const { event_id } = $page.params;

	function translateRole(role?: Role) {
		if (!role?.name) return "ERROR";
		switch (role.name) {
			case Roles.USER.name:
				return "un utilisateur";
			case Roles.MEMBER.name:
				return "un membre";
			case Roles.COMMITTEE.name:
				return "un membre du comité";
			default:
				return "ERROR";
		}
	}

	async function deleteEvent(id: number) {
		const res = await fetch("/api/events/" + id, {
			method: "DELETE",
		});
		if (res.ok) {
			goto("/events");
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	async function subscribe() {
		fetch("/api/events/" + event_id + "/subscribe", {
			method: "POST",
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$messageError = err.message;
			});
	}

	async function unsubscribe() {
		fetch("/api/events/" + event_id + "/subscribe", {
			method: "DELETE",
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$messageError = err.message;
			});
	}

	function eventHasUser(): Boolean {
		if(!data.authenticated) return false
		return data.subscribed.map((v) => v.id).includes(data.user!.id);
	}

	function copyMails() {
		const mails = data.subscribed.flatMap((v) => `${v.email}, `);
		const text = "".concat(...mails).slice(0, -2);
		navigator.clipboard.writeText(text);
		$info = "Les emails ont été copiés.";
	}

	let searchUserToAdd = "";
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
			let userListURL = new URL($page.url.origin + "/api/users/search");
			userListURL.searchParams.append("number", number as any);
			userListURL.searchParams.append("index", index as any);
			userListURL.searchParams.append("searchText", searchUserToAdd);

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
			$error = "An error occured";
			return [];
		}
	}

	const canSeeProfile = hasRolePermission(UserPermission.SEE_USERS_PROFILE, data.user?.role);
	const dateFormater = new Intl.DateTimeFormat("fr-Fr", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "Europe/Paris",
	});
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{data.event.title} | JDR-Poly</title>
	<meta name="title" content={`${data.event.title} | JDR-Poly`} />
	<meta
		name="description"
		content={`Un événement de ${data.event.category} le ${dateFormater.format(
			Date.parse(data.event.date),
		)}`}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content={`${data.event.title} | JDR-Poly`} />
	<meta
		property="og:description"
		content={`Un événement de ${data.event.category} le ${dateFormater.format(
			Date.parse(data.event.date),
		)}`}
	/>
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
					{#if data.authenticated && hasRolePermission("JOIN_EVENT_" + data.event.inscription_group.toUpperCase(), data.user?.role)}
						{#if !data.event.inscription_limit || data.subscribed.length < data.event.inscription_limit || eventHasUser()}
							{#if (!data.event.inscription_start || Date.now() >= Date.parse(data.event.inscription_start)) && (!data.event.inscription_stop || Date.now() < Date.parse(data.event.inscription_stop))}
								<div id="subscribe">
									{#if eventHasUser()}
										<IconButton
											icon="material-symbols:person-remove"
											label={`Se désinscrire de ${data.event.title}`}
											action={() => unsubscribe()}
											text="Se désinscrire"
											inline={true}
										/>
									{:else}
										<IconButton
											icon="material-symbols:person-add"
											label={`S'inscrire à ${data.event.title}`}
											action={() => subscribe()}
											text="S'inscrire"
											inline={true}
										/>
									{/if}
								</div>
							{:else}
								<p>Les inscriptions ne sont pas ouvertes.</p>
								{#if data.event.inscription_start && Date.now() < Date.parse(data.event.inscription_start)}
									<p>
										Ouverture des inscriptions le {dateFormater.format(
											Date.parse(data.event.inscription_start),
										)}
									</p>
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
							: ""}) :
					</h5>
					{#each data.subscribed as user}
						<div class="positioner">
							{#if canSeeProfile}
								<a href="/users/profile/{user.id}">{user.name}</a>
							{:else}
								<p>{user.name}</p>
							{/if}

							{#if hasRolePermission(UserPermission.REMOVE_USER_FROM_EVENT, data.user?.role)}
								<IconButton
									icon="material-symbols:close"
									action={() => {
										let urlForceDeleteSubscribedUser = new URL(
											$page.url.origin + "/api/admin/events/" + event_id + "/subscribe",
										);
										urlForceDeleteSubscribedUser.searchParams.append(
											"userId",
											user.id.toString(),
										);
										fetch(urlForceDeleteSubscribedUser, {
											method: "DELETE",
										})
											.then(() => {
												location.reload();
											})
											.catch((err) => {
												$messageError = err.message;
											});
									}}
									label={`Supprimer l'utilisateur ${user.name} de l'événement`}
									inline={true}
								/>
							{/if}
						</div>
					{/each}
					{#if hasRolePermission(UserPermission.SUBSCRIBE_USER_TO_EVENT, data.user?.role)}
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
											let urlForceAddUser = new URL(
												$page.url.origin +
													"/api/admin/events/" +
													event_id +
													"/subscribe",
											);
											urlForceAddUser.searchParams.append(
												"userId",
												result.id.toString(),
											);
											fetch(urlForceAddUser, {
												method: "POST",
											})
												.then(async (res) => {
													if (!res.ok) {
														const body = await res.json();
														$warning = body.message.includes(
															"duplicate key value violates",
														)
															? "Cette utilisateur est déjà dans la liste"
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
		{#if hasRolePermission(UserPermission.MODIFY_EVENT, data.user?.role)}
			<div class="admin-btn" style="right: 60px;">
				<IconButton
					icon="material-symbols:delete-outline"
					action={() => ($openDeleteConfirmDialog = true)}
					label={`Supprimer l'événement ${data.event.title}`}
					inline={true}
				/>
			</div>
			<div class="admin-btn" style="right: 120px;">
				<IconButton
					icon="material-symbols:edit"
					action={() => openEditDialog.set(true)}
					label="Supprimer l'événement"
					inline={true}
				/>
			</div>
			{#if hasRolePermission(UserPermission.SEE_MAIL, data.user?.role)}
				<div class="admin-btn" style="right: 180px;">
					<IconButton
						icon="material-symbols:mark-email-read"
						action={copyMails}
						label="Copier le mail des participants"
						inline={true}
					/>
				</div>
			{/if}
			<Edit event={data.event} open={openEditDialog} />

			<Dialog.Root open={$openDeleteConfirmDialog} onOutsideClick={() => ($openDeleteConfirmDialog = false)}>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Supprimer ?</Dialog.Title>
						<Dialog.Description>Êtes vous sûr de vouloir supprimer cet événement?</Dialog.Description>
					</Dialog.Header>
					<Dialog.Footer>
						<Button
							on:click={() => {
								$openDeleteConfirmDialog = false;
							}}>Annuler</Button
						>
						<Button on:click={() => {
							$openDeleteConfirmDialog = false;
							deleteEvent(data.event.id);
						}}>Oui</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
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
			background: url("/images/events/banner.webp") center/cover;
			aspect-ratio: 16/9;
			position: absolute;
			height: 100%;
			width: 100%;
		}

		.admin-btn {
			position: absolute;
			top: 20px;
			right: 60px;

			:global(button) {
				padding: 10px;
				border-radius: 200px;

				&:hover {
					background-color: lightgray;
					transition: 0.5s;
				}

				&:active {
					background-color: white;
				}
			}

			:global(svg) {
				font-size: 24px;
				color: black;
			}
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

				#subscribe {
					:global(button) {
						width: 60%;
						padding: 0.5em 0;
						background-color: $primary;
						color: white;
						font-family: "Ubuntu", "Arial";
						font-size: 1em;
						border-radius: 7px;
						text-transform: uppercase;
					}

					:global(svg) {
						font-size: 1.3em;
						margin-left: 5px;
					}
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

					:global(button) {
						position: absolute;
						right: 10%;
						font-size: 24px;
						border-radius: 200px;
						padding: 5px;
						transform: translateY(-20%);

						&:hover {
							background-color: lightgray;
						}

						&:active {
							background-color: white;
						}
					}

					:global(svg) {
						color: black;
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
