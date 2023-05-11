<script lang="ts">
	import { info, error } from '$lib/stores';
	import { page } from '$app/stores';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let emailChangeEmail1 = '';
	let emailChangeEmail2 = '';
	let emailChangePassword = '';

	let passwordChangeOldPassword = '';
	let passwordChangeNewPassword1 = '';
	let passwordChangeNewPassword2 = '';

	let nameChangeName = '';

	let deleteAccountPassword = '';
</script>

<svelte:head>
	<title>Paramètres | JDRPoly</title>
</svelte:head>

<main>
	<h2>Paramètres</h2>

	<p>Nom Prénom : <strong>{$page.data.user.name}</strong></p>
	<p>Email : <strong>{$page.data.user.email}</strong></p>

	<!-- Mail Update -->
	<form
		method="POST"
		action="?/updateEmail"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == 'success') {
					$info = 'Votre mail a été mis à jour.';
					update();
				} else if (result.type == 'failure') {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de Mail</h4>
		<Textfield
			input$name="email"
			type="text"
			bind:value={emailChangeEmail1}
			label="Nouveau mail"
			style="width: 100%"
		/>
		<Textfield
			type="text"
			bind:value={emailChangeEmail2}
			label="Copie du nouveau mail"
			style="width: 100%"
		/>
		<Textfield
			input$name="password"
			type="password"
			bind:value={emailChangePassword}
			label="Mot de passe"
			style="width: 100%"
		/>

		<Button
			touch
			variant="unelevated"
			disabled={!emailChangeEmail1 ||
				!emailChangePassword ||
				emailChangeEmail1 != emailChangeEmail2}
		>
			<Label>Changer</Label>
		</Button>
	</form>

	<!-- Name update -->
	<form
		method="POST"
		action="?/updateName"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == 'success') {
					$info = 'Votre nom a été mis à jour.';
					update();
				} else if (result.type == 'failure') {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de Nom</h4>
		<Textfield
			input$name="name"
			type="text"
			bind:value={nameChangeName}
			label="Nouveau Nom Prénom"
			style="width: 100%"
		/>

		<Button on:click={() => ''} touch variant="unelevated" disabled={!nameChangeName}>
			<Label>Changer</Label>
		</Button>
	</form>

	<!-- Password update -->
	<form
		method="POST"
		action="?/updatePassword"
		use:enhance={({}) => {
			return async ({ result, update }) => {
				if (result.type == 'success') {
					$info = 'Votre mot de passe a été mis à jour.';
					update();
				} else if (result.type == 'failure') {
					$error = result.data?.message;
				}
				invalidateAll();
			};
		}}
	>
		<h4>Changer de mot de passe</h4>
		<Textfield
			input$name="oldPassword"
			type="password"
			bind:value={passwordChangeOldPassword}
			label="Ancien mot de passe"
			style="width: 100%"
		/>
		<Textfield
			input$name="newPassword"
			type="password"
			bind:value={passwordChangeNewPassword1}
			label="Nouveau mot de passe"
			style="width: 100%"
		/>
		<Textfield
			type="password"
			bind:value={passwordChangeNewPassword2}
			label="Copie du nouveau mot de passe"
			style="width: 100%"
		/>

		<Button
			touch
			variant="unelevated"
			disabled={!passwordChangeOldPassword ||
				!passwordChangeNewPassword1 ||
				passwordChangeNewPassword1 != passwordChangeNewPassword2}
		>
			<Label>Changer</Label>
		</Button>
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
		<Textfield
			input$name="password"
			type="password"
			bind:value={deleteAccountPassword}
			label="Mot de passe"
			style="width: 100%"
		/>

		<Button on:click={() => ''} touch variant="unelevated" disabled={!deleteAccountPassword}>
			<Label>SUPPRIMER</Label>
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
