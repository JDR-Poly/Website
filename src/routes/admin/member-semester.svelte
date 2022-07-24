<script context="module" lang="ts">
	import { redirectIfNotAuthenticated } from '$lib/frontend/redirect';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (event) => {
		return redirectIfNotAuthenticated(event, '/');
	};
</script>
<script lang="ts">
	let periodsNumber = 1
	let mailText = ""

	let errorMails: string[] = []

	async function sendMailsMember() {
		let emails = mailText.split(",")
		emails.flatMap(str => str.split(";"))

			const res = await fetch('/api/admin/roles/mail-periods', {
				method: 'POST',
				body: JSON.stringify({emails, periods: periodsNumber}),
				headers: { 'Content-Type': 'application/json' }
			})
			const body = await res.json()
			if(res.ok) {
				errorMails = body.errorMails
				mailText = ""
			}
	} 
</script>

<input type="text" placeholder="emails" bind:value={mailText}>

<br>
<button on:click={() => {
	periodsNumber = Math.max(1, periodsNumber - 1)
}}>-</button>
<button on:click={() => {
	periodsNumber++}}>+</button>

<p>Ajouter {periodsNumber} semestre(s)</p>
<button on:click={sendMailsMember}>Ajouter</button>

{#if errorMails.length !== 0} 
	<h2>Il y a eu une erreur sur les mails de ces utilisateurs : </h2>
	{#each errorMails as mail}
		<p>mail</p>
	{/each}
{/if}