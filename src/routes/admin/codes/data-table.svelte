<!-- @format -->

<!--
    Data table for membership codes following the shadcn-svelte pattern.
    See: https://www.shadcn-svelte.com/docs/components/data-table
-->
<script lang="ts">
	import type { MembershipCode } from "$gtypes";
	import { createTable, Render, Subscribe } from "svelte-headless-table";
	import { readable, writable } from "svelte/store";
	import * as Table from "$lib/components/ui/table";
	import { addPagination, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
	import { Button } from "$lib/components/ui/button";
	import { ArrowUpDown, RotateCw } from "lucide-svelte";
	import { Input } from "$lib/components/ui/input";

	export let codes: MembershipCode[];

	// Track which tokens are currently being resent
	let resendingTokens = writable<Set<string>>(new Set());

	const table = createTable(readable(codes), {
		page: addPagination({ initialPageSize: 15 }),
		sort: addSortBy({
			toggleOrder: ["asc", "desc"],
			initialSortKeys: [
				{
					id: "email_sent",
					order: "desc",
				},
			],
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase().trim()),
		}),
	});

	const dateFormater = new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "long",
    	timeStyle: "short",
		timeZone: "Europe/Paris",
	});

	const periodLabels: Record<string, string> = {
		autumn: "Automne",
		spring: "Printemps",
		all: "Année complète",
	};

	const columns = table.createColumns([
		table.column({
			accessor: "email",
			header: "Email",
			plugins: {
				sort: {
					disable: true,
				},
			},
		}),
		table.column({
			accessor: "period",
			header: "Période",
			cell: ({ value }) => periodLabels[value] || value,
			plugins: {
				sort: {
					disable: true,
				},
				filter: {
					exclude: true,
				},
			},
		}),
		table.column({
			accessor: "year",
			header: "Année",
			plugins: {
				filter: {
					exclude: true,
				},
				sort: {
					disable: true,
				},
			},
		}),
		table.column({
			accessor: "email_sent",
			header: "Date d'envoi",
			cell: ({ value }) => dateFormater.format(value),
			plugins: {
				filter: {
					exclude: true,
				},
			},
		}),
		table.column({
			accessor: "validation_token",
			header: "Actions",
			cell: () => "", // Will render custom content
			plugins: {
				sort: {
					disable: true,
				},
				filter: {
					exclude: true,
				},
			},
		}),
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns);
	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;

	async function handleResend(token: string) {
		resendingTokens.update((set) => {
			set.add(token);
			return new Set(set);
		});

		try {
			const response = await fetch(`/api/codes/${token}/resend`, {
				method: "POST",
			});

			if (!response.ok) {
				const errorData = await response.json();
				alert(`Erreur: ${errorData.message || "Échec de l'envoi"}`);
			} else {
				alert("Code renvoyé avec succès!");
				// Reload the page to show updated email_sent date
				window.location.reload();
			}
		} catch (err) {
			alert("Erreur lors de l'envoi du code");
		} finally {
			resendingTokens.update((set) => {
				set.delete(token);
				return new Set(set);
			});
		}
	}
</script>

<div class="flex items-center py-4 justify-between">
	<div class="flex items-center">
		<Input class="max-w-md" placeholder="Filtrer par email..." type="text" bind:value={$filterValue} />
	</div>
	<div>
		<slot name="actions"></slot>
	</div>
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
									{#if cell.id === "email_sent"}
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
									{#if cell.id === "validation_token"}
										{@const token = cell.render()}
										<Button
											variant="outline"
											size="sm"
											disabled={$resendingTokens.has(String(token))}
											on:click={() => handleResend(String(token))}
										>
											<RotateCw class={`mr-2 h-4 w-4 ${$resendingTokens.has(String(token)) ? "animate-spin" : ""}`} />
											Renvoyer
										</Button>
									{:else}
										<Render of={cell.render()} />
									{/if}
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
		disabled={!$hasPreviousPage}>Précédent</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}>Suivant</Button
	>
</div>
