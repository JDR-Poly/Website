<script lang="ts">
	import Category from './Category.svelte';
	import { error } from '$lib/stores';
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Accordion from '@smui-extra/accordion';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import Fab, { Icon } from '@smui/fab';

	const reqCategories = fetch('/api/committee/categories')
		.then(async (res) => {
			return (await res.json()).categories;
		})
		.catch((err) => {
			$error = err.message;
		});

	const openAddDialog = writable(false);
</script>

{#await reqCategories}
	<!---->
{:then categories}
	<Accordion>
		{#each categories as category, i}
			<Category {category} open={i == 0} />
		{/each}
	</Accordion>

	{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
		<Add open={openAddDialog} {categories} />
		<div class="add-button-container">
			<Fab style="width:80px;height:80px;" on:click={() => ($openAddDialog = true)}>
				<Icon class="material-icons" style="font-size:40px;">add</Icon>
			</Fab>
		</div>
	{/if}
{/await}

<style lang="scss">
	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;

		:root {
			--mdc-theme-secondary: limegreen;
		}
	}
</style>
