<!-- @format -->
<script lang="ts">
	import Category from "./Category.svelte";
	import { writable, type Readable } from "svelte/store";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import type { PageData } from "./$types";
	import IconButton from "$components/IconButton.svelte";
	import { page } from "$app/stores";
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import Add from './Add.svelte'

	export let data: PageData;

	const openAddDialog = writable(false);

	let openAccordions = writable([data.categories[0]])
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Comité | JDRPoly</title>
	<meta name="title" content="Comité | JDRPoly" />
	<meta name="description" content="Comité de JDR-Poly, comission de l'Agepoly." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Comité | JDRPoly" />
	<meta property="og:description" content="Comité de JDR-Poly, comission de l'Agepoly." />
</svelte:head>

<main>
	<h2>Comité :</h2>
	<Accordion.Root  class="w-full" value={$openAccordions}>
		{#each data.categories as category}
			<Category {category} {openAccordions}/>
		{/each}
	</Accordion.Root>
</main>

{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, data.user?.role)}
	<Add open={openAddDialog} categories={data.categories} />
	<div class="add-button-container">
		<div class="add-button-container">
			<IconButton
				action={() => ($openAddDialog = true)}
				icon="material-symbols:add"
				inline={true}
				label="Ajouer un comité"
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	main {
		width: 80%;
		padding: 10px;
		//box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
		margin: 2em auto;
		border-radius: 5px;
	}
	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;
		z-index: 3;
		:global(button) {
			background-color: limegreen;
			border-radius: 200px;
		}

		:global(svg) {
			font-size: 60px;
		}
	}
</style>
