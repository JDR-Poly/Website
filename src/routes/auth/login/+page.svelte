<script lang="ts">
	import type { ActionData } from "./$types";

	let email = '';
	let password = '';

	export let form: ActionData;
</script>

<div>
	<h1>Se connecter</h1>

	<form method="POST">
		<input name="email" type="email" bind:value={email} placeholder="Mail" />
		<input name="password" type="password" bind:value={password} placeholder="Mot de passe" />
	
		<button type='submit'>Se connecter</button>

		{#if form?.incorrectFormat}<p class="error">Entrez un mail et mot de passe correct</p>{/if}
		{#if form?.wrongCreditentials}<p class="error">Mot de passe ou email incorrect</p>{/if}
	</form>

</div>

<a href="/auth/register">Vous ne possédez pas de compte ?</a>

<style>
	div {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}
	input {
		height: 2rem;
		width: 30%;
		margin: 12px;
	}
</style>
