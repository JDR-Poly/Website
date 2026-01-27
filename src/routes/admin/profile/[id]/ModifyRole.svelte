<!-- @format -->
<script lang="ts">
	import { error } from "$lib/stores";
	import { Role, Roles } from "$lib/userPermissions";
	import type { Semesters, User } from "$gtypes";
	import { onMount } from "svelte";
	import { Period, periodFromYearSemesters } from "$lib/publicMemberPeriod";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";

	export let user: User;

	let roleName = user.role?.name;

	const userPeriod = new Period(user.member_start, user.member_stop);

	let member_stop = user.member_stop ? new Date(Date.parse(user.member_stop)) : new Date(Date.now());
	// member_stop.setDate(member_stop.getDate() - 1);
	const is_first_year_half: boolean = member_stop.getMonth() <= 6;
	console.log(member_stop);
	console.log(is_first_year_half);
	const year = member_stop.getFullYear() + (is_first_year_half ? -1 : 0);
	const options = is_first_year_half ? [
		"1 semestre"
	] : [
		"1 semestre", "2 semestres"
	];

	let periodsNumber = "1";

	let semesters: Semesters;
	$: semesters = is_first_year_half ? 'spring' : (periodsNumber === "2" ? 'all' : 'autumn');
	$: period_dates = periodFromYearSemesters(year, semesters).combineWith(userPeriod);

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
				semesters: roleName == Roles.MEMBER.name ? semesters : undefined,
				year: roleName == Roles.MEMBER.name ? year : undefined,
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
<select bind:value={roleName} disabled={roleList.length <= 1}>
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
	{#if period_dates.start}
		<p>Membre à partir de: <strong>{dateFormater.format(period_dates.start)}</strong></p>
	{/if}
	{#if period_dates.stop}
		<p>Fin de membre: <strong>{dateFormater.format(period_dates.stop)}</strong></p>
	{/if}
	<br />
	Ajouter :
	<RadioGroup.RadioGroup 
		bind:value={periodsNumber}
	>
		{#each options as option, i}
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value={(i+1).toString()} id={option} name={option}/>
				<Label for={option}>{option}</Label>
			</div>
		{/each}
		<RadioGroup.Input name="periodsNumber" />
	</RadioGroup.RadioGroup>
	
{/if}

<br />
	
<Button variant="outline" disabled={!roleName} on:click={() => submitChange()}>Changer</Button>
