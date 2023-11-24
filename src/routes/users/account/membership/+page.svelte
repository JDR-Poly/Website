<!-- @format -->
<script lang="ts">
	import { error, info } from "$lib/stores";
	import Textfield from "@smui/textfield";
	import { applyAction, enhance } from "$app/forms";
	import IconButton from "$components/IconButton.svelte";

	let memberCode = "";

	function validateForm(event: MouseEvent) {
		(event.target as any).parentElement.parentElement.submit();
	}
</script>

<svelte:head>
	<title>Entrer un code | JDRPoly</title>
	<meta name="description" content={`Activer son code pour devenir membre`} />
</svelte:head>

<main>
	<h2>Valider un semestre de membre</h2>
	<form
		method="POST"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == "success") {
					$info = `${result.data?.periodNumber} semestre(s) ajouté(s)`;
					update();
				} else if (result.type === "error" && result.error.message) {
					$error = result.error.message;
				}
				await applyAction(result);
			};
		}}
	>
		<Textfield
			type="text"
			input$name="validation_token"
			bind:value={memberCode}
			label="Code membre"
			class="solo-input"
			variant="outlined"
		/>
		<IconButton
			action={validateForm}
			icon="material-symbols:done"
			disabled={memberCode === ""}
			inline={true}
			label="Submit"
		/>
		<!-- Validate form -->
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

	form {
		:global(svg) {
			color: black;
			font-size: 36px;
		}
		:global(button) {
			margin-left: 10px;
			transform: translateY(20%);
			padding: 5px;
			border-radius: 200px;

			&:hover {
				background-color: lightgray;
			}
		}
	}
</style>
