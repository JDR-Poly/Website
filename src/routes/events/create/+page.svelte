<script lang="ts">
	import { UserPermission } from "$lib/userPermissions";
	import {error, info} from "$lib/stores"
	import { goto } from "$app/navigation";

	let title = ''
	let description = ''
	let date = new Date(Date.now())
	let inscription = false
	let inscription_group = 'MEMBER'
	let inscription_start: Date | undefined = undefined
	let inscription_stop: Date | undefined = undefined
	
	let isInscriptionStop = false //Not an actual stored value in the database

	function returnJoinEventRoles(): string[] {
		let res = []
		for(let permission in UserPermission) {
			if(permission.includes("JOIN_EVENT_")) {
				res.push(permission.split("JOIN_EVENT_")[1])
			}
		}
		return res
	}

	async function submit() {
		const data = {
			title,
			description,
			date,
			inscription,
			inscription_group,
			inscription_start,
			inscription_stop
		}
		

		const res = await fetch('/api/events/', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		});
		const body = await res.json();
		if (res.ok) {
			goto('/events/' + body.id)
			$info = "L'évènement a bien été crée"
		} else {
			$error = body.message
		}
	}

</script>

<form method="POST">
	<input id="title" name="title" type="text" bind:value={title} placeholder="Titre"/>
	<br>
	<input id="description" name="description" type="text"  bind:value={description} placeholder="description"/>
	<br>
	<label for="date"> Date</label>
	<input id="date" name="date" type="date"  bind:value={date}/>
	<br>
	<input id="inscription" name="inscription" type="checkbox"  bind:checked={inscription} on:change={() => {		
		if(!inscription) {
			inscription_group = 'MEMBER'
			inscription_start = undefined
			inscription_stop = undefined
			isInscriptionStop = false
		}
	}}/>
	<label for="inscription"> Inscription?</label><br>

	{#if inscription}
		<label for="inscription_group">Rôle pour s'inscrire :</label>
		<select id="inscription_group" name="inscription_group" bind:value={inscription_group}>
			{#each returnJoinEventRoles() as role}
				<option value={role}>{role}</option>
			{/each}
		</select>
		<br>

		<label for="inscription_start">Début d'inscription</label>
		<input id="inscription_start" name="inscription_start" type="date"  bind:value={inscription_start}/>
		<br>

		<input id="isInscriptionStop" name="isInscriptionStop" type="checkbox"  bind:checked={isInscriptionStop} on:change={() => {
			if(!isInscriptionStop) {
				inscription_stop = undefined
			}
		}}/>
		<label for="isInscriptionStop"> Date de fin d'inscription?</label>
		<br>

		{#if isInscriptionStop}
			<label for="inscription_stop">Fin d'inscription</label>
			<input id="inscription_stop" name="inscription_stop" type="date"  bind:value={inscription_stop}/>
			<br>
		{/if}
	{/if}

	<button on:click|preventDefault={submit} disabled={!Boolean(title && date)}>Créer l'évènement</button>


</form>

<style>
	input {
		margin: 10px;
	}
</style>