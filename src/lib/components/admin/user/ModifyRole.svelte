<script lang="ts">
	import type { User } from 'src/types';

	export let user: User;

	let roleName = user.role?.name;

	const rolesQuery = fetch('/api/admin/roles/modifiableRoles', {
		method: 'POST',
		body: JSON.stringify({ id: user.id }),
		headers: { 'Content-Type': 'application/json' }
	}).then((res) => (res.ok ? res.json().then((json) => json.roles) : []));

	async function submitRoleChange() {
		const res = await fetch('/api/admin/roles/changeRole', {
				method: 'POST',
				body: JSON.stringify({ user, role: roleName }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.ok) {
				location.reload();
			}
	}
</script>

{#await rolesQuery}
	<p>Loading role</p>
{:then roles}
	<!-- Role change -->
	<form on:submit|preventDefault={submitRoleChange}>
		<select bind:value={roleName} disabled={roles.length === 0}>
			{#if roles.length === 0}
				<option value={roleName}>{roleName}</option>
			{:else}
				{#each roles as roleOption}
					<option value={roleOption.name}>{roleOption.name}</option>
				{/each}
			{/if}
		</select>
		<button>Changer</button>
	</form>
{/await}
