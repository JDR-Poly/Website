<script lang="ts">
	import { error } from '$lib/stores';
	import Radio from '@smui/radio';
  	import FormField from '@smui/form-field';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Button, { Label } from '@smui/button';
	import LinearProgress from '@smui/linear-progress';
	import { applyAction, enhance } from '$app/forms';

	let errorMails: string[] = [];

	let periodsNumber = 1;
	let mailText = '';

	let waitingForResult = false
</script>

<svelte:head>
	<title>Mails | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Envoyer des codes membres</h2>
	<form method="POST" use:enhance={({ }) => {
		waitingForResult = true

		return async ({ result, update }) => {
			waitingForResult = false
			if (result.type == 'success') {
				errorMails = result.data?.errorMails
				if(!(errorMails.length > 0)) {
					update()
				}
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
		{#if waitingForResult}
			<LinearProgress indeterminate/>
		{/if}
		<Button color="primary" variant="unelevated" disabled={waitingForResult}>
			<Label>Ajouter</Label>
		</Button>

		
	</form>

	
	{#if errorMails.length > 0}
		<div id="error">
			<h3>Erreurs dans ces mails :</h3>
			<p>(Les autres mails ont bien été envoyés)</p>
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
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin: 15px 0;
		}

		#error {
			h3,p {
				color: red;
			}
			h3 {
				text-transform: uppercase;
				font-weight: 600;
				letter-spacing: 0.15em;
				margin-top: 2em;
			}
			ul {
				margin: 2em 0;
				margin-left: 35px;
			}
			
		}
	}
	
	form {
		width: fit-content;

		:global(.mdc-linear-progress) {
			margin: 2em 0;
		}

		:global(.mdc-button) {
			margin: 1em 0
		}
	}
	:global(.mdc-text-field__input) {
		width: min(500px, 70vw);
	}
</style>