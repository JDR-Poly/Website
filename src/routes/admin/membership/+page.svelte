<!-- @format -->
<script lang="ts">
	import { error } from "$lib/stores";
	import { applyAction, enhance } from "$app/forms";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";
	import type { PageData, ActionData } from './$types';

	export let form: ActionData;
	
	let waitingForResult = false;
	let errorMails: undefined | string[]
</script>

<svelte:head>
	<title>Mails | JDRPoly</title>
</svelte:head>

<main>
	<h2>Envoyer des codes membres</h2>
	<form
		method="POST"
		use:enhance={({}) => {
			waitingForResult = true;

			return async ({ result, update }) => {				
				waitingForResult = false;
				if (result.type == "success") {
					errorMails = form?.errorMails;
										
					if (errorMails == null || errorMails.length > 0) {
						update();
					}
				} else if (result.type === "error" && result.error.message) {
					$error = result.error.message;
				}
				await applyAction(result);
			};
		}}
	>	
		<RadioGroup.RadioGroup value="1">
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="1" id="option-1" name="test1"/>
				<Label for="option-1">1</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="2" id="option-2" name="test1"/>
				<Label for="option-2">2</Label>
			</div>
			<RadioGroup.Input name="periodsNumber" />
		</RadioGroup.RadioGroup>
		<Label>Emails</Label>
		<Textarea placeholder="test@gmail.com,dark.vador@jdrpoly.ch, informatique@jdrpoly.ch" name="emails" />
		<Button type="submit">Ajouter</Button>
	</form>

	{#if errorMails && errorMails.length > 0}
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
			h3,
			p {
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
</style>
