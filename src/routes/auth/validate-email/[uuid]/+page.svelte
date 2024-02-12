<!-- @format -->
<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	const { uuid } = $page.params;

	export let data: PageData;

	onMount(() => {
		if (data.success) {
			setTimeout(() => {
				invalidateAll();
			}, 3000);
		}
	});
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
	{#if data.success}
		<h2>Vous avez bien validé votre email !</h2>
		<p>Vous allez être redirigé sous peu.</p>
	{:else}
		<h2>Code invalide</h2>
		<p>Le code <strong>{uuid}</strong> n'est pas un code valide.</p>
	{/if}
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
		}
	}
</style>
