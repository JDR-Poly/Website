<!-- @format -->
<script lang="ts">
	import { error, info, warning } from "$lib/stores";
	import { applyAction, enhance } from "$app/forms";
	import IconButton from "$components/IconButton.svelte";
	import { page } from "$app/stores";
	import Label from "$components/ui/label/label.svelte"; 
	import { Input } from "$lib/components/ui/input";
	import { redirect, type ActionResult } from "@sveltejs/kit";

	let memberCode = "";

	function validateForm(event: MouseEvent) {
		(event.target as any).parentElement.parentElement.submit();
	}

	type UpdateFunction = (options?: {
		reset?: boolean;
		invalidateAll?: boolean;
	}) => Promise<void>

	async function resultCallback({result, update}: {result: ActionResult, update: UpdateFunction}) {
		
		if (result.type == "success") {
			$info = `${result.data?.periodNumber} semestre(s) ajouté(s)`;
			redirect(300, "/")
			return
		} else if (result.type === "failure" && result.data?.message) {
			$warning = result.data.message
		} else if (result.type === "error" && result.error.message) {
			$error = result.error.message;
		}
		update()
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Entrer un code | JDRPoly</title>
	<meta name="title" content="Entrer un code | JDRPoly" />
	<meta name="description" content="Activer son code pour devenir membre." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Entrer un code | JDRPoly" />
	<meta property="og:description" content="Activer son code pour devenir membre." />
</svelte:head>

<main>
	<h2>Valider un semestre de membre</h2>
	<form
		method="POST"
		use:enhance={({}) => {
			return resultCallback
		}}
		class="flex"
	>
		<div class="flex w-full max-w-sm flex-col gap-1.5">
			<Label for="title">Code membre</Label>
			<Input type="text" id="title" bind:value={memberCode} name="validation_token"/>
		</div>

		<IconButton
			action={validateForm}
			icon="material-symbols:done"
			disabled={memberCode === ""}
			inline={false}
			label="Submit"
		/>
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
