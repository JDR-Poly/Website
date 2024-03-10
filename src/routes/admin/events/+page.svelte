<!-- @format -->
<script lang="ts">
	import type { PageData } from "./$types";
	import type { Event } from "$gtypes";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import IconButton from "$components/IconButton.svelte";
	import DataTable from "./data-table.svelte";

	export let data: PageData;

	let events: Event[] = data.events;
</script>

<main>
	<div class="container mx-auto py-10">
		<h2>Événements :</h2>
		<DataTable {events}/>
	</div>

	{#if hasRolePermission(UserPermission.CREATE_EVENT, $page.data.user?.role)}
		<div class="add-button-container">
			<div class="add-button-container">
				<IconButton
					action={() => goto("/events/create")}
					icon="material-symbols:add"
					inline={true}
					label="Créer un événement"
				/>
			</div>
		</div>
	{/if}
</main>

<style lang="scss">
	main {
		margin: 4em;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 5px;
		}
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
