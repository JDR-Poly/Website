<script lang="ts">
	import Icon from '@iconify/svelte';
	import Dropdown from './Dropdown.svelte';
	import IconButton from '$components/IconButton.svelte';

	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';

	let responsive = false;

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		await goto('/');
		invalidateAll();
	}

	function closeNavBar() {
		responsive = false;
	}
</script>

<div class="topnav" class:responsive>
	<a href="/" on:click={closeNavBar}>
		<img src="/images/logo-white.svg" alt="Logo jdrpoly" id="svg" />
	</a>

	<div id="close-icon">
		<IconButton icon="material-symbols:close" action={closeNavBar}/>
	</div>

	<a href="/" class="nav-link nav-button" on:click={closeNavBar}>
		<Icon icon="material-symbols:home-outline" style="font-size: 24px;margin-right: 2px;"></Icon>
		<p>Accueil</p>
	</a>

	<a href="/events" class="nav-link nav-button" on:click={closeNavBar}>
		<Icon icon="material-symbols:event-outline-rounded" style="font-size: 24px;margin-right: 2px;"></Icon>
		<p>Événements</p>
	</a>

	<Dropdown
		{responsive}
		{closeNavBar}
		data={{
			element: {
				prefix_icon: 'material-symbols:info-outline',
				text: 'Informations'
			},
			links: [
				{
					element: {
						prefix_icon: 'mdi:map-marker-outline',
						text: 'Accès'
					},
					link: '/infos/plan'
				},
				{
					element: {
						prefix_icon: 'material-symbols:description-outline',
						text: 'Documents'
					},
					link: '/infos/docs'
				},
				{
					element: {
						prefix_icon: 'material-symbols:meeting-room-outline',
						text: 'Services'
					},
					link: '/infos/services'
				}
			]
		}}
	/>

	<Dropdown
		{responsive}
		{closeNavBar}
		data={{
			element: {
				prefix_icon: 'material-symbols:groups',
				text: 'Communauté'
			},
			links: [
				{
					element: {
						prefix_icon: 'material-symbols:broken-image-outline-rounded',
						text: 'Photos'
					},
					link: '/community/photos'
				},				{
					element: {
						prefix_icon: 'material-symbols:group-outline',
						text: 'Commission'
					},
					link: '/community/committee'
				}
				// ,				{
				// 	element: {
				// 		prefix_icon: 'partner_exchange',
				// 		text: 'Partenaires/Amis'
				// 	},
				// 	link: '/community/parteners'
				// }
			]
		}}
	/>

	<a href="/books" class="nav-link nav-button" on:click={closeNavBar}>
		<Icon icon="material-symbols:book" style="font-size: 24px;margin-right: 2px;"></Icon>
		<p>Bibliothèque</p>
	</a>

	{#if $page.data.authenticated}
		{#if hasRolePermission(UserPermission.ADMIN_PANEL, $page.data.user?.role)}
			<Dropdown
				{responsive}
				{closeNavBar}
				data={{
					element: {
						prefix_icon: 'material-symbols:admin-panel-settings-outline',
						text: 'Admin'
					},
					links: [
						{
							element: {
								prefix_icon: 'material-symbols:outgoing-mail-outline',
								text: 'Envoyer un code'
							},
							link: '/admin/membership'
						},
						{
							element: {
								text: 'Événements',
								prefix_icon: 'material-symbols:dataset-linked-outline'
							},
							link: '/admin/events'
						},
						{
							element: {
								prefix_icon: 'material-symbols:search',
								text: 'Utilisateurs'
							},
							link: '/admin/users'
						}
					]
				}}
			/>
		{/if}
		<div id="user-div">
			<Dropdown
				{responsive}
				{closeNavBar}
				data={{
					element: {
						prefix_icon: 'material-symbols:person	',
						text: $page.data.user?.name ? $page.data.user?.name : 'Utilisateur'
					},
					links: [
						{
							element: {
								prefix_icon: 'material-symbols:person',
								text: 'Profil'
							},
							link: `/users/profile/${$page.data.user?.id}`
						},
						{
							element: {
								prefix_icon: 'material-symbols:settings-account-box-outline',
								text: 'Paramètres'
							},
							link: '/users/account/settings'
						},
						{
							element: {
								prefix_icon: 'material-symbols:keyboard-double-arrow-right',
								text: 'Entrer un code'
							},
							link: '/users/account/membership'
						}
					],
					actions: [
						{
							element: {
								prefix_icon: 'material-symbols:logout-rounded',
								text: 'Déconnexion'
							},
							action: logout
						}
					]
				}}
			/>
		</div>
	{:else}
		<a class="log-button nav-button" href="/auth/login"  on:click={closeNavBar}>
			<Icon icon="material-symbols:login-rounded" style="font-size: 24px;margin-right: 4px; color:white;s"></Icon>
			<p class="">Se connecter</p>
		</a>
	{/if}

	<div id="nav-icon" class="">
		<IconButton icon="material-symbols:list-rounded" action={() => {responsive = true}}/>
	</div>
</div>

<style lang="scss">
	.nav-button {
		padding: 7px 16px;
		text-align: center;
		text-decoration: none;
		font-size: 17px;
		display: flex;
		align-content: center;
		align-items: center;
	}

	.topnav {
		background-color: #030528;
		overflow: hidden;
		padding: 0.9em 4em 0.9em 4em;
		display: flex;

		.log-button {
			margin-left: auto;
			border: solid 1px $secondary;

			* {
				display: inline;
				vertical-align: middle;
				color: $secondary;
			}

			&:hover {
				background-color: $secondary;
				color: black;

				* {
					color: black;
				}
			}
		}

		#nav-icon {
			display: none;
			color: $secondary;
			margin-left: auto;
			position: relative;
			margin-right: 50px;
			:global(button) {
				position: absolute;
				top: 50%;
				-ms-transform: translateY(-50%);
				transform: translateY(-50%);
				font-size: 40px;
			}
			:global(button .mdc-icon-button__ripple) {
				transform: translate(-14%, -14%); //tricky bad practice for good sized ripple effect

				&::after {
					background-color: $secondary;
					width: 40px;
					height: 40px;
				}
			}
		}

		#close-icon {
			display: none;
			color: $secondary;
			margin-left: auto;
			position: relative;
			margin-right: 84px;
			top: -80px;
			:global(button) {
				position: absolute;
				top: 50%;
				-ms-transform: translateY(-50%);
				transform: translateY(-50%);
				font-size: 40px;
			}
			:global(button .mdc-icon-button__ripple) {
				transform: translate(-3%, -5%); //tricky bad practice for good sized ripple effect

				&::after {
					background-color: $secondary;
					width: 30px;
					height: 30px;
				}
			}
		}

		.nav-link {
			color: $secondary;

			* {
				display: inline;
				vertical-align: middle;
			}

			p {
				letter-spacing: 0.05em;
				font-size: 19px;
			}

			&:hover {
				background-color: $primary-light;
				color: white;
			}
		}

		#user-div {
			margin-left: auto;
			margin-right: 25px;
		}

		:global(#user-div .dropdown) {
			height: 100%;
			background-color: red;
		}
	}

	#svg {
		width: 150px;
		margin-right: 2em;
	}

	@media screen and (max-width: 1400px) {
		.topnav:not(.responsive) :global(*:not(:first-child)) {
			display: none;
		}

		.topnav #nav-icon {
			display: block;
		}

		.topnav.responsive {
			flex-direction: column;
			position: relative;
			padding: 2em 2em 2rem 2em;

			#svg {
				margin-bottom: 2em;
			}

			#nav-icon {
				display: none;
			}

			.log-button {
				margin: 20px 0 20px 0;
				justify-content: center;
			}

			#user-div {
				margin-left: 0;
			}

			.nav-link {
				padding: 0.5em 16px;
			}

			#close-icon {
				display: block;
			}
		}
	}
</style>
