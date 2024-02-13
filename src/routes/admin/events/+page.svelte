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

	function handleSort() {
		events.sort((a: Event, b: Event) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === "ascending" ? "slice" : "reverse"
			]() as [any, any];
			if (!aVal || !bVal) return 0;
			if (sort == "date") {
				const aDate = new Date(Date.parse(aVal));
				const bDate = new Date(Date.parse(bVal));
				if (aDate < bDate) return -1;
				else if (aDate.getTime() == bDate.getTime()) return 0;
				else return 1;
			} else if (typeof aVal == "number" && typeof bVal == "number") {
				return Number(aVal) - Number(bVal);
			}

			return 0;
		});
		events = events;
	}

	let sort: keyof Event = "date";
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
