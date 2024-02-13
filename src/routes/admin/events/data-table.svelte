<!-- @format -->

<!--
    Looks complicated but you only need to follow this : 
    https://www.shadcn-svelte.com/docs/components/data-table
-->
<script lang="ts">
	import type { Event } from "$gtypes";
	import { createTable, Render, Subscribe } from "svelte-headless-table";
	import { readable } from "svelte/store";
	import * as Table from "$lib/components/ui/table";
	import { addPagination, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
	import { Button } from "$lib/components/ui/button";
	import { ArrowUpDown } from "lucide-svelte";
	import { Input } from "$lib/components/ui/input";

	export let events: Event[];

	const table = createTable(readable(events), {
		page: addPagination({ initialPageSize: 15 }),
		sort: addSortBy({
			toggleOrder: ["asc", "desc"],
			initialSortKeys: [
				{
					id: "id",
					order: "desc",
				},
			],
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase().trim()),
		}),
	});

	const dateFormater = new Intl.DateTimeFormat("fr-Fr", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "Europe/Paris",
	});

	const columns = table.createColumns([
		table.column({
			accessor: "id",
			header: "Id",
			plugins: {
				filter: {
					exclude: true,
				},
			},
		}),
		table.column({
			accessor: "title",
			header: "Titre",
			plugins: {
				sort: {
					disable: true,
				},
			},
		}),
		table.column({
			accessor: "category",
			header: "Categorie",
			plugins: {
				sort: {
					disable: true,
				},
				filter: {
					exclude: false,
				},
			},
		}),
		table.column({
			accessor: ({ date }) => Date.parse(date),
			header: "Date",
			cell: ({ value }) => dateFormater.format(value),
			plugins: {
				filter: {
					exclude: true,
				},
			},
		}),
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
    const { filterValue } = pluginStates.filter;
</script>

<div class="flex items-center py-4">
	<Input class="max-w-md" placeholder="Filtrer par titre ou catégorie..." type="text" bind:value={$filterValue} />
</div>
<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head {...attrs}>
									{#if cell.id === "id" || cell.id === "Date"}
										<Button variant="ghost" on:click={props.sort.toggle}>
											<Render of={cell.render()} />
											<ArrowUpDown class={"ml-2 h-4 w-4"} />
										</Button>
									{:else}
										<Render of={cell.render()} />
									{/if}
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									<Render of={cell.render()} />
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
<div class="flex items-center justify-end space-x-4 py-4">
	<Button
		variant="outline"
		size="sm"
		on:click={() => ($pageIndex = $pageIndex - 1)}
		disabled={!$hasPreviousPage}>Previous</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
	>
</div>
