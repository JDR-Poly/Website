<script lang="ts">
	import { page } from '$app/stores';
	import ModifyRole from '$lib/components/admin/users/ModifyRole.svelte';

	const { id } = $page.params;

	const userQuery = fetch('/api/users/' + id)
		.then((res) => res.json())
</script>

{#await userQuery}
	<h2>Chargement de la page</h2>
{:then user}
	<p style="text-size: 16px;">Modifier les données de <strong>{user.name}</strong></p>

	<ModifyRole {user} />
{/await}
