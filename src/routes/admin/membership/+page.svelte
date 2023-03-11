<script lang="ts">
	import { error } from '$lib/stores';
	import Radio from '@smui/radio';
  	import FormField from '@smui/form-field';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Button, { Label } from '@smui/button';
	import type { ActionResult } from '@sveltejs/kit';
	import { applyAction, enhance } from '$app/forms';

	let errorMails: string[] = [];

	let periodsNumber = 1;
	let mailText = '';

</script>

<svelte:head>
	<title>Mails | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Envoyer des codes membres</h2>
	<form method="POST" use:enhance={({ }) => {
		return async ({ result }) => {
			if (result.type == 'success') {
				errorMails = result.data?.errorMails
			} else if(result.type === 'error' && result.error.message) {
				$error = result.error.message
			}
			await applyAction(result);
		}
	}}>
		<Textfield textarea bind:value={mailText} label="Mails" input$name="emails">
			<HelperText slot="helper">test@gmail.com,dark.vador@jdrpoly.ch, informatique@jdrpoly.ch</HelperText>
		</Textfield>
		<p>Combien de semestres ?</p>
		{#each ['1 semestre', '2 semestres'] as option, i}
			<FormField >
				<Radio bind:group={periodsNumber} value={i + 1} touch input$name="periodsNumber" /><span slot="label">{option}</span>
			</FormField>
		{/each}
		<br>
		<Button color="primary" variant="unelevated">
			<Label>Ajouter</Label>
		</Button>
	</form>

	{#if errorMails.length > 0}
		<div id="error">
			<h3>Erreurs dans ces mails :</h3>
			<ul>
				{#each errorMails as mail}
					<li>{mail}</li>
				{/each}
			</ul>
		</div>
	{/if}
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			font-family: 'Ubuntu';
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin: 15px 0;
		}

		#error {
			h3 {
				font-family: 'Ubuntu';
				text-transform: uppercase;
				font-weight: 600;
				letter-spacing: 0.15em;
				margin: 2em 0;
				color: red;
			}
			ul {
				margin-left: 35px;
			}
			
		}
	}
	
	:global(.mdc-text-field__input) {
		width: 500px;
	}
</style>