<!-- @format -->
<script lang="ts">
	import { error } from "$lib/stores";
	import { Role, Roles } from "$lib/userPermissions";
	import type { User } from "$gtypes";
	import { onMount } from "svelte";
	import { Period } from "$lib/publicMemberPeriod";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";

	export let user: User;

	let roleName = user.role?.name;

	let userPeriod = new Period(user.member_start, user.member_stop);

	let period = userPeriod.clone();

	let periodsNumber = "1";
	updatePeriod(periodsNumber);

	function updatePeriod(periodsString: string) {
		const nbr = parseInt(periodsString) || 1;
		period = userPeriod.clone();
		period.addSemesters(nbr);
	
		if (roleName == Roles.MEMBER.name) {
			period.start = new Date(Date.now());
		}
	}

	let roleList: Role[] = [];

	onMount(async () => {
		roleList = await fetch(`/api/admin/roles/grant?userId=${user.id}`).then(async (res) => {
			return res.ok ? await res.json() : [];
		});
	});

	async function submitChange() {
		const res = await fetch(`/api/admin/roles/grant?userId=${user.id}`, {
			method: "PATCH",
			body: JSON.stringify({
				role: roleName,
				periodsNumber: roleName == Roles.MEMBER.name ? periodsNumber : 0,
			}),
			headers: { "Content-Type": "application/json" },
		});
		if (res.ok) {
			location.reload();
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}

	const dateFormater = new Intl.DateTimeFormat("fr-Fr", {
		dateStyle: "long",
		timeZone: "Europe/Paris",
	});
</script>

<!-- Role change -->
<select bind:value={roleName} disabled={roleList.length <= 1} on:change={() => updatePeriod(periodsNumber)}>
	{#if roleList.length === 0}
		<option value={roleName}>{roleName}</option>
	{:else}
		{#each roleList as roleOption}
			<option value={roleOption.name}>{roleOption.name}</option>
		{/each}
	{/if}
</select>

<br />

{#if roleName == Roles.MEMBER.name}
	{#if period.start}
		<p>Membre à partir de: <strong>{dateFormater.format(period.start)}</strong></p>
	{/if}
	{#if period.stop}
		<p>Fin de membre: <strong>{dateFormater.format(period.stop)}</strong></p>
	{/if}
	<br />
	Ajouter :
	<RadioGroup.RadioGroup 
		bind:value={periodsNumber}
		onValueChange={() => updatePeriod(periodsNumber)}
	>
		{#each ["1 semestre", "2 semestres"] as option, i}
			<div class="flex items-center space-x-2">
				{i+1}
				<RadioGroup.Item value={(i+1).toString()} id={option} name={option}/>
				<Label for={option}>{option}</Label>
			</div>
		{/each}
		<RadioGroup.Input name="periodsNumber" />
	</RadioGroup.RadioGroup>
	
{/if}

<br />
	
<Button variant="outline" disabled={!roleName} on:click={() => submitChange()}>Changer</Button>
