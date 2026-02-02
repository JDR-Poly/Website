<!-- @format -->
<script lang="ts">
	import { error, info, warning } from "$lib/stores";
	import { page } from "$app/stores";
	import Label from "$components/ui/label/label.svelte"; 
	import { Input } from "$lib/components/ui/input";
	import Button from "$components/ui/button/button.svelte";
	import type { ActionData } from "./$types";

	let memberCode = "";

	export let form: ActionData;

	if (form?.success) {
		$info = "Code validé!";
	}
	if (form?.invalid) {
		$warning = form.message;
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Entrer un code | JDR-Poly</title>
	<meta name="title" content="Entrer un code | JDR-Poly" />
	<meta name="description" content="Activer son code pour devenir membre." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Entrer un code | JDR-Poly" />
	<meta property="og:description" content="Activer son code pour devenir membre." />
</svelte:head>

<main>
	<h2>Valider un semestre de membre</h2>
	<form
		method="POST"
		class="flex"
	>
		<div class="flex w-full max-w-sm flex-col gap-1.5">
			<Label for="title">Code membre</Label>
			<div class="flex">
				<Input type="text" id="title" bind:value={memberCode} name="validation_token"/>
				<Button type="submit">valider</Button>
			</div>
		</div>
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
			padding: 5px;
			border-radius: 10px;

			&:hover {
				background-color: lightgray;
				color: black;
			}
		}
	}
</style>
