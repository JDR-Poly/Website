<script lang="ts">
	import { error } from '$lib/stores';
	import { Role, Roles } from '$lib/userPermissions';
	import type { User } from '$gtypes';
	import { onMount } from 'svelte';
	import FormField from '@smui/form-field';
	import Radio from '@smui/radio';
	import Button, { Label } from '@smui/button';
	import { Period } from '$lib/publicMemberPeriod';
	import Checkbox from '@smui/checkbox';

	export let user: User;

	let roleName = user.role?.name;

	let userPeriod = new Period(user.member_start, user.member_stop);

	let period = userPeriod.clone()

	let periodsNumber = 1;
	let addMemberPeriod = false;
	updatePeriod(periodsNumber);

	function updatePeriod(periodsNumber: number) {
		period = userPeriod.clone()	
		period.addSemesters(periodsNumber);
		if (roleName == Roles.MEMBER.name) {
			period.start = new Date(Date.now());
		}
	}

	let roleList: Role[] = [];

	onMount(async () => {
		roleList = await fetch(`/api/admin/roles/grant?id=${user.id}`).then(async (res) => {
			return res.ok ? await res.json() : [];
		});
	});

	async function submitChange() {
		const res = await fetch('/api/admin/roles/grant', {
			method: 'POST',
			body: JSON.stringify({
				id: user.id,
				role: roleName,
				periodsNumber: addMemberPeriod ? periodsNumber : 0
			}),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) {
			location.reload();
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	const dateFormater = new Intl.DateTimeFormat('fr-Fr', {
		dateStyle: 'long',
		timeZone: 'Europe/Paris'
	});
</script>

<!-- Role change -->
<select
	bind:value={roleName}
	disabled={roleList.length <= 1}
	on:change={() => updatePeriod(periodsNumber)}
>
	{#if roleList.length === 0}
		<option value={roleName}>{roleName}</option>
	{:else}
		{#each roleList as roleOption}
			<option value={roleOption.name}>{roleOption.name}</option>
		{/each}
	{/if}
</select>

<br />

{#if roleName == Roles.MEMBER.name || roleName == Roles.USER.name}
	<FormField>
		<Checkbox bind:checked={addMemberPeriod} />
		<span slot="label">Ajouter une période de membre.</span>
	</FormField>

	{#if addMemberPeriod}
		{#if period.start}
			<p>Membre à partir de: <strong>{dateFormater.format(period.start)}</strong></p>
		{/if}
		{#if period.stop}
			<p>Fin de membre: <strong>{dateFormater.format(period.stop)}</strong></p>
		{/if}
		<br />
		{#each ['1 semestre', '2 semestres'] as option, i}
			<FormField>
				<Radio
					bind:group={periodsNumber}
					value={i + 1}
					touch
					on:change={() => {
						updatePeriod(periodsNumber);
					}}
				/><span slot="label">{option}</span>
			</FormField>
		{/each}
	{/if}
{/if}
<br />
<Button on:click={() => submitChange()} touch variant="unelevated" disabled={!roleName}>
	<Label>Changer</Label>
</Button>
