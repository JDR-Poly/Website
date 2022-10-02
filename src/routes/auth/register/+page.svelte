<script lang="ts">
	import { error } from '$lib/stores';

	let email = '';
	let name = '';
	let password = '';

</script>

<div>
	<h1>S'inscrire</h1>
	<form method="POST">
		<input name="email" type="email" bind:value={email} placeholder="Mail" />
		<input name="username" type="text" bind:value={name} placeholder="Username" />
		<input name="password" type="password" bind:value={password} placeholder="Mot de passe" />
		<button>S'inscrire</button>
	</form>
	
</div>

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
