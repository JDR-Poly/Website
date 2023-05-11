<script lang="ts">
	import { error, info } from '$lib/stores';
	import Textfield from '@smui/textfield';
	import Fab from '@smui/fab';
	import { Icon } from '@smui/common';
	import { applyAction, enhance } from '$app/forms';

	let memberCode = '';
</script>

<svelte:head>
	<title>Entrer un code | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Valider un semestre de membre</h2>
	<form method="POST" use:enhance={({ }) => {
		return async ({ result, update }) => {			
			if (result.type == 'success') {
				$info = `${result.data?.periodNumber} semestre(s) ajouté(s)`
				update()
			} else if(result.type === 'error' && result.error.message) {
				$error = result.error.message
			}
			await applyAction(result);
		}
	}}>
		<Textfield type="text" input$name="validation_token" bind:value={memberCode} label="Code membre" class="solo-input" variant="outlined"/>
		<Fab disabled={memberCode === ''} color="primary" mini class="solo-fab">
			<Icon class="material-icons">done</Icon>
		</Fab>
	</form>
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin: 15px 0;
		}	
	}

	form :global(.mdc-text-field__input) {
		width: 50vw;
		max-width: 700px;
		min-width: 200px;
	}
</style>
