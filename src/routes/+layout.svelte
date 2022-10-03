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
			<li>Commission</li>
			<li>Documents officiel</li>
		</ul>

		<p>Évenements</p>
		<ul>
			<li><a href="/events">Calandrier</a></li>
		</ul>
		{#if authenticated && user.is_email_validated}
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
				<li><a href="/users/account/settings">Paramètres</a></li>
				<li><button on:click={logout}>Se déconnecter</button></li>
			</ul>
		{:else if !authenticated}
			<a href="/auth/login">Se connecter</a>
		{/if}
	</ul>
</nav>

<slot />


<AlertDisplay/>