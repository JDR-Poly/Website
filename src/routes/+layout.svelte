<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import AlertDisplay from "$lib/components/AlertDisplay.svelte";
	import { page } from '$app/stores';
	import { UserPermission } from "$lib/userPermissions";
	
	async function logout() {
		const res = await fetch('/api/auth/logout', { method: 'POST' });
		invalidateAll()
	}
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
			<li>Nocturnes</li>
			<li>Soirée membres</li>
		</ul>
		
		{#if $page.data.authenticated && $page.data.user.is_email_validated}
			{#if $page.data.user.role?.permissions.has(UserPermission.ADMIN_PANEL)}
				<p>Panel admin</p>
				<ul>
					<li><a href="/admin/membership">Ajouter un membre</a></li>
				</ul>
				<br />	
			{/if}
		
			<p>{$page.data.user.name}</p>
			<ul>
				<li><a href="/users/profile/{$page.data.user.id}">Profile</a></li>
				<li><a href="/users/account/settings">Paramètres</a></li>
				<li><button on:click={logout}>Se déconnecter</button></li>
			</ul>
		{:else if !$page.data.authenticated}
			<a href="/auth/login">Se connecter</a>
		{/if}
	</ul>
</nav>

<slot />


<AlertDisplay/>