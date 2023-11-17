<script lang="ts">
	import Category from './Category.svelte';
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Accordion from '@smui-extra/accordion';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import type { PageData } from './$types';
	import IconButton from '$components/IconButton.svelte';

	export let data: PageData;

	const openAddDialog = writable(false);
</script>

<svelte:head>
	<title>Comité | JDRPoly</title>
	<meta name="description" content="Comité de JDR-Poly, comission de l'Agepoly">
</svelte:head>

<main>
	<h2>Comité :</h2>
	<Accordion>
		{#each data.categories as category, i}
			<Category {category} defaultOpen={i == 0} />
		{/each}
	</Accordion>
</main>

{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, data.user?.role)}
	<Add open={openAddDialog} categories={data.categories} />
	<div class="add-button-container">
		<div class="add-button-container">
			<IconButton action={() => ($openAddDialog = true)} icon="material-symbols:add" inline={true} label="Ajouer un comité"/>
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
