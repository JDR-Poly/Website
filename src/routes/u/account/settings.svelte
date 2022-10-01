<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { redirectIfNotAuthenticated } from '$lib/frontend/redirect';

	export const load: Load = async (event) => {
		return redirectIfNotAuthenticated(event, '/auth/login');
	};
</script>

<script lang="ts">
	import { warning, info } from '$lib/stores';
	let memberCode = '';

	let result: string;
	async function validateMembershipCode() {
		const res = await fetch('/api/u/validate-membership-code', {
			method: 'POST',
			body: JSON.stringify({ validation_token: memberCode }),
			headers: { 'Content-Type': 'application/json' }
		});
		const body = await res.json();
		if (res.ok) {
			$info = 'Vous avez reçu ' + body.periodsNumber + ' semestre(s) de membre.';
		} else {
			$warning = "Ce code n'est pas valide";
		}
	}
</script>

<h2>Account setting</h2>

<p>Valider un semestre de membre</p>
<input type="text" placeholder="code" bind:value={memberCode} />
<button on:click={validateMembershipCode}>Valider</button>

{#if result}
	<p>{result}</p>
{/if}
