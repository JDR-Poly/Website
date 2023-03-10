<script lang="ts">
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';

	const { id } = $page.params;

	export let data: any;
</script>

<h1>Profile</h1>
<p>Email: {data.user_profile.email}</p>
<p>Nom: {data.user_profile.name}</p>
<p>Role: {data.user_profile.role?.name}</p>
<p>Date de création: {data.user_profile.account_creation}</p>
{#if $page.data.authenticated && hasRolePermission(UserPermission.MODIFY_USERS_DATA, $page.data.user.role)}
		<a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
{/if}