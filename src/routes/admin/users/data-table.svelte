<!-- @format -->

<!--
    Looks complicated but you only need to follow this : 
    https://www.shadcn-svelte.com/docs/components/data-table
-->
<script lang="ts">
	import type { User } from "$gtypes";
	import { createTable, Render, Subscribe } from "svelte-headless-table";
	import { writable } from "svelte/store";
	import * as Table from "$lib/components/ui/table";
	import { Button } from "$lib/components/ui/button";
	import { ArrowUpDown } from "lucide-svelte";
	import { getTranslatedRoleName } from "$utils";

	export let users: User[];
	export let pageSize: number;

	let page = 0;
	let sortOrder: "asc" | "desc" = "desc";
	let lastPage = users.length <= pageSize;
	let userWritable = writable(lastPage ? users : users.slice(0, -1));

	async function updateUsers() {
		fetch(`/api/users/search?number=${pageSize + 1}&sort=${sortOrder}&index=${page * pageSize}`) //always request one more to know if it's the last page.
			.then(async (res) => {
				return res.json();
			})
			.then((users: User[]) => {
				lastPage = users.length <= pageSize;
				userWritable.set(lastPage ? users : users.slice(0, -1));
			});
	}

	const table = createTable(userWritable);

	const columns = table.createColumns([
		table.column({
			accessor: "id",
			header: "Id",
		}),
		table.column({
			accessor: "name",
			header: "Nom",
		}),
		table.column({
			accessor: "role",
			cell: ({ value }) => getTranslatedRoleName(value as string),
			header: "Rôle",
		}),
		table.column({
			accessor: "email",
			header: "Email",
		}),
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns);
</script>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head {...attrs}>
									{#if cell.id === "id"}
										<Button
											variant="ghost"
											on:click={() => {
												if (sortOrder === "asc") {
													sortOrder = "desc";
												} else {
													sortOrder = "asc";
												}
												updateUsers();
											}}
										>
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
									<!--
											I have yet to found a way to put a link on the whole row instead of the individual
											cells. Doing this on the whole row leads to display issues.
										-->
									<a
										href={`/users/profile/${row.cells[0].render()}`}
										class="text-black block"
									>
										<Render of={cell.render()} />
									</a>
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
		on:click={() => {
			page--;
			updateUsers();
		}}
		disabled={page <= 0}>Previous</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={lastPage}
		on:click={() => {
			page++;
			updateUsers();
		}}>Next</Button
	>
</div>
