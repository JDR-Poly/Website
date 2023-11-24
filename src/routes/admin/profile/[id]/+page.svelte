<!-- @format -->
<script lang="ts">
	import type { PageData } from "./$types";
	import ModifyRole from "./ModifyRole.svelte";

	export let data: PageData;
</script>

<main>
	<h2>Modifier les données de {data.profileUser.name}</h2>

	<ModifyRole user={data.profileUser} />
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
	}
</style>
