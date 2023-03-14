<script lang="ts">
	import Category from './Category.svelte';
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Accordion from '@smui-extra/accordion';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import Fab, { Icon } from '@smui/fab';

	export let data: any;

	const openAddDialog = writable(false);
</script>

<svelte:head>
	<title>Comité | JDRPoly</title> 
</svelte:head>

<main>
	<Accordion>
		{#each data.categories as category, i}
			<Category {category} defaultOpen={i == 0} />
		{/each}
	</Accordion>
</main>


{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
	<Add open={openAddDialog} categories={data.categories} />
	<div class="add-button-container">
		<Fab style="width:80px;height:80px;" on:click={() => ($openAddDialog = true)}>
			<Icon class="material-icons" style="font-size:40px;">add</Icon>
		</Fab>
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

		:global(.mdc-fab > i) {
			color: $secondary;
		}

		:global(.mdc-fab) {
			background-color: limegreen;
		}
	}

</style>
