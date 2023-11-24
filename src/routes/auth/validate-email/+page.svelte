<!-- @format -->
<script lang="ts">
	import { info, error } from "$lib/stores";
	import Button, { Label } from "@smui/button";
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	function getUserEmail(): string {
		if (data.user) return data.user.email!;
		else return "";
	}
	export let data: PageData;
</script>

<svelte:head>
	<title>Valider email | JDRPoly</title>
	<meta name="description" content="Valider mail d'utilisateur" />
</svelte:head>

<main>
	<h2>En attente de validation du mail</h2>
	<p>
		Vous avez dû recevoir un mail de validation à l'email: <strong>{getUserEmail()}</strong>
	</p>

	<form
		method="POST"
		use:enhance={({}) => {
			return async ({ result }) => {
				if (result.type == "success") {
					$info = "Le mail vient d'être envoyé";
				} else if (result.type == "failure") {
					$error = result?.data?.message;
				}
			};
		}}
	>
		<div class="button">
			<Button touch variant="unelevated">
				<Label>Renvoyer un mail</Label>
			</Button>
		</div>
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
