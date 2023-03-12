<script lang="ts">
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';

	const { id } = $page.params;

	export let data: any;

	const dateFormater = new Intl.DateTimeFormat('fr-Fr', {
		dateStyle: 'long',
		timeZone: 'Europe/Paris'
	})
</script>

<svelte:head>
	<title>{data.user_profile.name} | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Profile</h2>

	{#if hasRolePermission(UserPermission.SEE_MAIL, $page.data.user.role)}
		<p>Email: <strong>{data.user_profile.email}</strong></p>
	{/if}
	<p>Nom: <strong>{data.user_profile.name}</strong></p>
	<p>Date de création: <strong>{dateFormater.format(Date.parse(data.user_profile.account_creation))}</strong></p>
	<p>Role: <strong>{data.user_profile.role?.name}</strong></p>

	{#if data.user_profile.member_start}
		<p>Membre depuis: <strong>{dateFormater.format(Date.parse(data.user_profile.member_start))}</strong></p>
	{/if}
	{#if data.user_profile.member_stop}
		<p>Fin de membre: <strong>{dateFormater.format(Date.parse(data.user_profile.member_stop))}</strong></p>
	{/if}

	{#if hasRolePermission(UserPermission.MODIFY_USERS_DATA, $page.data.user.role)}
			<a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
	{/if}
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;
		color: #777;
		font-family: 'Ubuntu';

		p,a {
			font-size: 20px;
			margin: 4px;
		}
		strong {
			color: #4b4b4b;;
		}
		a {
			margin-top: 1em;
			display: block;
		}

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}
	}
</style>
