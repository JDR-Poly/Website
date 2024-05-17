<!-- @format -->
<script lang="ts">
	import { page } from "$app/stores";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { getTranslatedRoleName } from "$utils";
	import type { PageData } from "./$types";

	const { id } = $page.params;

	export let data: PageData;

	const dateFormater = new Intl.DateTimeFormat("fr-Fr", {
		dateStyle: "long",
		timeZone: "Europe/Paris",
	});


</script>

<svelte:head>
	<title>{data.profile.name} | JDRPoly</title>
</svelte:head>

<main>
	<h2>Profil :</h2>

	{#if hasRolePermission(UserPermission.SEE_MAIL, data.user?.role)}
		<p>Email: <strong>{data.profile.email}</strong></p>
	{/if}
	<p>Nom: <strong>{data.profile.name}</strong></p>
	<p>
		Date de création: <strong>{dateFormater.format(Date.parse(data.profile.account_creation))}</strong>
	</p>
	<p>Rôle: <strong>{getTranslatedRoleName(data.profile.role?.name)}</strong></p>

	{#if data.profile.member_start}
		<p>
			Membre à partir de: <strong>{dateFormater.format(Date.parse(data.profile.member_start))}</strong>
		</p>
	{/if}
	{#if data.profile.member_stop}
		<p>
			Fin de membre: <strong>{dateFormater.format(Date.parse(data.profile.member_stop))}</strong>
		</p>
	{/if}

	{#if hasRolePermission(UserPermission.MODIFY_USERS_DATA, $page.data.user.role)}
		<a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
	{/if}
	{#if $page.data.user.id == id}
		<a href="/users/account/settings">Modifier vos données</a>
	{/if}
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;
		color: #777;

		p,
		a {
			font-size: 20px;
			margin: 4px;
		}
		strong {
			color: #4b4b4b;
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
