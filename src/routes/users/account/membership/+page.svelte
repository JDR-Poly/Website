<script lang="ts">
	import { warning, info } from '$lib/stores';
	import { Input } from '@smui/textfield';
	import Paper from '@smui/paper';
	import Fab from '@smui/fab';
	import { Icon } from '@smui/common';
	import { error } from '@sveltejs/kit';

	let memberCode = '';

	async function validateMembershipCode() {
		fetch('/api/users/membership/validate', {
			method: 'POST',
			body: JSON.stringify({ validation_token: memberCode }),
			headers: { 'Content-Type': 'application/json' }
		}).then((res) => {
			if(res.ok) $info = 'Période de membre ajoutée';
			else throw error(500, "Invalid code")
		}).catch((err) => {
			$warning = "Ce code n'est pas valide";
		})
	}
</script>

<div class="main-container">
	<h2>Valider un semestre de membre</h2>
	<div class="solo-container">
		<Paper class="solo-paper" elevation={6}>
			<Input bind:value={memberCode} placeholder="Code membre" class="solo-input" />
		</Paper>
		<Fab
			on:click={validateMembershipCode}
			disabled={memberCode === ''}
			color="primary"
			mini
			class="solo-fab"
		>
			<Icon class="material-icons">done</Icon>
		</Fab>
	</div>
</div>

<style>
	.main-container {
		padding: 36px 18px;
		background-color: var(--mdc-theme-background, #f8f8f8);
		border: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
	}
	.solo-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	* :global(.solo-paper) {
		display: flex;
		align-items: center;
		flex-grow: 1;
		max-width: 600px;
		margin: 0 12px;
		padding: 0 12px;
		height: 48px;
	}
	* :global(.solo-paper > *) {
		display: inline-block;
		margin: 0 12px;
	}
	* :global(.solo-input) {
		flex-grow: 1;
		color: var(--mdc-theme-on-surface, #000);
	}
	* :global(.solo-input::placeholder) {
		color: var(--mdc-theme-on-surface, #000);
		opacity: 0.6;
	}
	* :global(.solo-fab) {
		flex-shrink: 0;
	}
</style>
