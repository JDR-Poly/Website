<script lang="ts">
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import type { User } from 'src/types';
	import { error } from '$lib/stores';

	const { id } = $page.params;

	const userPromise: Promise<User> = fetch('/api/users/' + id )
		.then(async (res) => {
			
			const body = await res.json()
			if(!res.ok) {
				$error = body.message
			}
			return body
		})
</script>

{#await userPromise}
	<h2>Loading user</h2>
{:then profileUser}
	<h1>Profile</h1>
	<p>Email: {profileUser.email}</p>
	<p>Nom: {profileUser.name}</p>
	<p>Role: {profileUser.role?.name}</p>
	<p>Date de création: {profileUser.account_creation}</p>
	{#if $page.data.authenticated && hasRolePermission(UserPermission.MODIFY_USERS_DATA, $page.data.user.role)}
		<a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
	{/if}
{:catch err}
	<h1>{err}</h1>
{/await}
