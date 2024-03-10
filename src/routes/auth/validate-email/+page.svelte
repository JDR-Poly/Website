<!-- @format -->
<script lang="ts">
	import { info, error } from "$lib/stores";
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import type { ActionResult } from "@sveltejs/kit";
	import { Button } from "$lib/components/ui/button";

	function getUserEmail(): string {
		if (data.user) return data.user.email!;
		else return "";
	}

	function handleRequestEmail(
		result: ActionResult<Record<string, unknown> | undefined, Record<string, unknown> | undefined>,
	) {
		if (result.type == "success") {
			$info = "Le mail vient d'être envoyé";
		} else if (result.type == "failure") {
			let message = result?.data?.message;
			if (message) $error = message as string;
		}
	}
	export let data: PageData;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Valider email | JDRPoly</title>
	<meta name="title" content="Valider email | JDRPoly" />
	<meta name="description" content="Valider son mail d'utilisateur" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Valider email | JDRPoly" />
	<meta property="og:description" content="Valider son mail d'utilisateur" />
</svelte:head>

<main>
	<h2>En attente de validation du mail</h2>
	<p>
		Vous avez dû recevoir un mail de validation à l'email: <strong>{getUserEmail()}</strong>
	</p>

	<form
		method="POST"
		use:enhance={({}) => {
			return async ({ result }) => handleRequestEmail(result);
		}}
	>
		<Button type="submit">Renvoyer un mail</Button>
	</form>
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		p {
			white-space: pre-line;
			line-height: 27px;
			text-align: justify;
			margin-bottom: 2em;
			color: #777;
			font-size: 23px;
		}
	}
</style>
