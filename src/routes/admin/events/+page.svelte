<script lang="ts">
	import type { PageData } from './$types';
	import DataTable, { Head, Body, Row, Cell, SortValue, Label } from '@smui/data-table';
	import type { Event } from '$gtypes';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import IconButton from '$components/IconButton.svelte';
	import IB from '@smui/icon-button';
	export let data: PageData;

	let events: Event[] = data.events;
	function handleSort() {
		events.sort((a: Event, b: Event) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]() as [any, any];
			if (!aVal || !bVal) return 0;
			if (sort == 'date') {
				const aDate = new Date(Date.parse(aVal));
				const bDate = new Date(Date.parse(bVal));
				if (aDate < bDate) return -1;
				else if (aDate.getTime() == bDate.getTime()) return 0;
				else return 1;
			} else if (typeof aVal == 'number' && typeof bVal == 'number') {
				return Number(aVal) - Number(bVal);
			}

			return 0;
		});
		events = events;
	}

	let sort: keyof Event = 'date';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
</script>

<main>
	<h2>Événements</h2>

	<DataTable
		table$aria-label="Événements"
		style="width: 100%;"
		sortable
		bind:sort
		bind:sortDirection
		on:SMUIDataTable:sorted={handleSort}
	>
		<Head>
			<Row>
				<Cell numeric columnId="id">
					<IB class="material-icons">arrow_upward</IB>
					<Label>Id</Label>
				</Cell>
				<Cell sortable={false}>Titre</Cell>
				<Cell sortable={false}>Catégorie</Cell>
				<Cell columnId="date">
					<Label>Date</Label>
					<IB class="material-icons">arrow_upward</IB>
				</Cell>
			</Row>
		</Head>
		<Body>
			{#each events as event (event.id)}
				<Row>
					<Cell numeric>{event.id}</Cell>
					<Cell><a href="/events/{event.id}">{event.title}</a></Cell>
					<Cell>{event.category}</Cell>
					<Cell
						>{new Intl.DateTimeFormat('fr-Fr', {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							second: 'numeric',
							hour12: false,
							timeZone: 'Europe/Paris'
						}).format(Date.parse(event.date))}</Cell
					>
				</Row>
			{/each}
		</Body>
	</DataTable>

	{#if hasRolePermission(UserPermission.CREATE_EVENT, $page.data.user?.role)}
		<div class="add-button-container">
			<div class="add-button-container">
				<IconButton action={() => goto('/events/create')} icon="material-symbols:add" inline={true} label="Créer un événement"/>
			</div>
		</div>
	{/if}
</main>

<style lang="scss">
	main {
		margin: 4em auto;
		width: 70%;
		min-height: 70vh;

		h2 {
			margin-bottom: 0.5em;
			width: fit-content;
		}
	}

	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;
		:global(button) {
			background-color: limegreen;
			border-radius: 200px;
		}

		:global(svg) {
			font-size: 60px;
		}
	}
</style>
