<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import AlertDisplay from "$lib/components/AlertDisplay.svelte";
	import { page } from '$app/stores';
	import { UserPermission, Role, hasRolePermission } from "$lib/userPermissions";
	import type { User } from "src/types";
	
	async function logout() {
		const res = await fetch('/api/auth/logout', { method: 'POST' });
		invalidateAll()
	}

	let user: User
	let authenticated: Boolean
	$: user = $page.data.user
	$: authenticated = $page.data.authenticated
</script>

<nav>
	<a href="/">Accueil</a>
	<ul>
		<p>Communauté</p>
		<ul>
			<li><a href="/users">Utilisateurs</a></li>
			<li>Photos</li>
		</ul>

		<p>Informations</p>
		<ul>
			<li><a href="/committee">Commission</a></li>
			<li>Documents officiel</li>
		</ul>
		<p><a href="/books">Bibliothèque</a></p>

		<p>Évenements</p>
		<ul>
			<li><a href="/events">Calandrier</a></li>
		</ul>
		{#if authenticated}
			{#if hasRolePermission(UserPermission.ADMIN_PANEL, user?.role)}
				<p>Panel admin</p>
				<ul>
					<li><a href="/admin/membership">Ajouter un membre</a></li>
					<li><a href="/events/create">Créer un évènement</a></li>
				</ul>
				<br />	
			{/if}
			<p>{user.name}</p>
			<ul>
				<li><a href="/users/profile/{user.id}">Profile</a></li>
				{#if user.is_email_validated}
					<li><a href="/users/account/settings">Paramètres</a></li>
					<li><a href="/users/account/membership">Code membre</a></li>
				{:else}
					<li><a href="/auth/validate-email">Valider votre email</a></li>
				{/if}
				<li><button on:click={logout}>Se déconnecter</button></li>

			</ul>
		{:else if !authenticated}
		<ul>
			<li><a href="/auth/login">Se connecter</a></li>
			<li><a href="/auth/register">Créer un compte</a></li>
		</ul>
		{/if}
	</ul>
</nav>

<slot />

<AlertDisplay/>