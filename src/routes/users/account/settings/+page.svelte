<!-- @format -->
<script lang="ts">
	import { info, error } from "$lib/stores";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button";
	import type { PageData } from "./$types";
	
	let emailChangeEmail1 = "";
	let emailChangeEmail2 = "";
	let emailChangePassword = "";

	let passwordChangeOldPassword = "";
	let passwordChangeNewPassword1 = "";
	let passwordChangeNewPassword2 = "";

	let nameChangeName = "";

	let deleteAccountPassword = "";

	export let data: PageData;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Paramètres | JDR-Poly</title>
	<meta name="title" content="Paramètres | JDR-Poly" />
	<meta name="description" content="Changer ses paramètres." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Paramètres | JDR-Poly" />
	<meta property="og:description" content="Changer ses paramètres." />
</svelte:head>

<main>
	<h2>Paramètres</h2>

	<p>Nom Prénom : <strong>{data.user.name}</strong></p>
	<p>Email : <strong>{data.user.email}</strong></p>
	{#if data.user.discord_username}
		<p>Discord Username : <strong>{data.user.discord_username}</strong></p>
	{/if}

	<!-- Mail Update -->
	<form
		method="POST"
		action="?/updateEmail"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == "success") {
					$info = "Votre mail a été mis à jour.";
					update();
				} else if (result.type == "failure") {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de Mail</h4>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="email1" class="text-right">Nouveau email</Label>
			<Input type="email" id="email1" name="email" bind:value={emailChangeEmail1} class="col-span-3" />
		</div>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="email2" class="text-right">Copie du nouveau mail</Label>
			<Input type="email" id="email2" bind:value={emailChangeEmail2} class="col-span-3" />
		</div>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="email-password" class="text-right">Mot de passe</Label>
			<Input type="password" id="email-password" name="password" bind:value={emailChangePassword} class="col-span-3" />
		</div>


		<Button
			type="submit"
			disabled={!emailChangeEmail1 || !emailChangePassword || emailChangeEmail1 != emailChangeEmail2}
		>
			Changer
		</Button>
	</form>

	<!-- Name update -->
	<form
		method="POST"
		action="?/updateName"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == "success") {
					$info = "Votre nom a été mis à jour.";
					update();
				} else if (result.type == "failure") {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de Nom</h4>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="new-name" class="text-right">Nouveau Nom Prénom</Label>
			<Input type="text" id="new-name" name="name" bind:value={nameChangeName} class="col-span-3" />
		</div>

		<Button type="submit" disabled={!nameChangeName}>
			Changer
		</Button>
	</form>

	<!-- Password update -->
	<form
		method="POST"
		action="?/updatePassword"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == "success") {
					$info = "Votre mot de passe a été mis à jour.";
					update();
				} else if (result.type == "failure") {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de mot de passe</h4>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="old-password" class="text-right">Ancien mot de passe</Label>
			<Input type="password" id="old-password" name="oldPassword" bind:value={passwordChangeOldPassword} class="col-span-3" />
		</div>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="new-password1" class="text-right">Nouveau mot de passe</Label>
			<Input type="password" id="new-password1" name="newPassword" bind:value={passwordChangeNewPassword1} class="col-span-3" />
		</div>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="new-password2" class="text-right">Copie du nouveau mot de passe</Label>
			<Input type="password" id="new-password2" bind:value={passwordChangeNewPassword2} class="col-span-3" />
		</div>

		<Button
			type="submit"
			disabled={!passwordChangeOldPassword ||
				!passwordChangeNewPassword1 ||
				passwordChangeNewPassword1 != passwordChangeNewPassword2}
		>
			Changer
		</Button>
	</form>

	<!-- Link Discord -->
	<form
		method="POST"
		action="?/linkDiscord"
		use:enhance={({}) => {
			return async ({ result }) => {
				if (result.type == "redirect") {
					window.location.href = result.location
				} else if (result.type == "failure") {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		{#if data.user.discord_id}
			<h4>Mettre à jour son compte Discord</h4>
			<Button type="submit">
				Mettre à jour son compte discord
			</Button>
		{:else}
			<h4>Lier son compte Discord</h4>
			<Button type="submit">
				Lier son compte
			</Button>
		{/if}
		
	</form>
	

	<!-- Delete account -->
	<form
		method="POST"
		action="?/deleteAccount"
		use:enhance={({}) => {
			return async ({ result }) => {
				invalidateAll();
			};
		}}
	>
		<h4>Supprimer son compte</h4>
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="delete-password" class="text-right">Mot de passe</Label>
			<Input type="password" id="delete-password" name="password" bind:value={deleteAccountPassword} class="col-span-3" />
		</div>

		<Button type="submit" disabled={!deleteAccountPassword}>
			SUPPRIMER
		</Button>
	</form>
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;
		color: #777;

		p {
			font-size: 20px;
		}

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		form {
			margin: 4em 0;

			h4 {
				font-size: 22px;
				color: #4b4b4b;
			}
		}
	}
</style>
