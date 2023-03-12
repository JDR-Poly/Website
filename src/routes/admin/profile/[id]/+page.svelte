<script lang="ts">
	import ModifyRole from './ModifyRole.svelte';

	export let data: any;
</script>


<main>
	<h2>Modifier les données de {data.name}</h2>

	<ModifyRole user={data} />
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;

		h2 {
			font-family: 'Ubuntu';
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}
	}
</style>
