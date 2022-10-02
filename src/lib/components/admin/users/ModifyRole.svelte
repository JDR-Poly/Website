<script lang="ts">
	import { page } from '$app/stores';
	import { error } from '$lib/stores';
	import { Roles } from '$lib/userPermissions';
	import type { User } from 'src/types';

	export let user: User;

	let roleName = user.role?.name;

	let roleListUrl = new URL($page.url.origin + '/api/admin/roles/grant');
	roleListUrl.searchParams.append('id', user.id as any);
	const rolesQuery = fetch(roleListUrl)
		.then((res) => {
			return res.ok ? res.json() : []
		});

	async function submitRoleChange() {
		const res = await fetch('/api/admin/roles/grant', {
			method: 'POST',
			body: JSON.stringify({ id: user.id, roleName }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) {
			location.reload();
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	async function submitMemberPeriodChange() {
		const res = await fetch('/api/admin/roles/member-period', {
			method: 'POST',
			body: JSON.stringify({ id: user.id, periods: numberOfPeriods }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) {
			location.reload();
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	let memberPeriod: any;
	let numberOfPeriods = 0;
	async function fetchNewPeriod() {
		let url = new URL($page.url.origin + '/api/admin/roles/member-period');
		url.searchParams.append('id', user.id as any);
		url.searchParams.append('periods', numberOfPeriods as any);
		const res = await fetch(url);
		const body = await res.json();
		if (res.ok) {
			memberPeriod = body;
			console.log(memberPeriod)

		} else {
			$error = body.message;
		}
	}

	fetchNewPeriod();
</script>

{#await rolesQuery}
	<p>Loading role</p>
{:then roles}
	<!-- Role change -->
	<select bind:value={roleName} disabled={roles.length === 0}>
		{#if roles.length === 0}
			<option value={roleName}>{roleName}</option>
		{:else}
			{#each roles as roleOption}
				<option value={roleOption.name}>{roleOption.name}</option>
			{/each}
		{/if}
	</select>

	{#if memberPeriod}
		{#if roleName === Roles.MEMBER.name || roleName === Roles.USER.name}
			<p>Début de membre: {memberPeriod.start}</p>
			<p>Fin de membre: {memberPeriod.stop}</p>

			<button
				on:click={() => {
					numberOfPeriods = Math.max(numberOfPeriods - 1, 0);
					memberPeriod = undefined;
					fetchNewPeriod();
				}}>-</button
			>
			<button
				on:click={() => {
					numberOfPeriods++;
					memberPeriod = undefined;
					fetchNewPeriod();
				}}>+</button
			>
			<br />
			<button on:click={submitMemberPeriodChange}>Ajouter {numberOfPeriods} semestre(s)</button>
		{/if}
		<button on:click={submitRoleChange}>Changer de rôle</button>
	{/if}
{/await}
