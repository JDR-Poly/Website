<script lang="ts">
	import type { PageData } from './$types';
	import DataTable, { Head, Body, Row, Cell, SortValue, Label } from '@smui/data-table'
	import type { Event } from '$gtypes';
	import IconButton from '@smui/icon-button';

	export let data: PageData;

	let events: Event[] = data.events
	function handleSort() {
		events.sort((a: Event, b: Event) => {
			const [aVal, bVal] = [a[sort], b[sort]][sortDirection === 'ascending' ? 'slice' : 'reverse']();			
			if(!aVal || !bVal) return 0
			if(aVal instanceof Date && bVal instanceof Date) {				
				if(aVal < bVal) return -1 
				else if(aVal.getTime()==bVal.getTime()) return 0
				else return 1
			} else if(typeof aVal == 'number' && typeof bVal == 'number') {				
				return Number(aVal) - Number(bVal);
			}

			return 0
		});
		events = events
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
					<IconButton class="material-icons">arrow_upward</IconButton>
					<Label>Id</Label>
				</Cell>
				<Cell sortable={false}>Titre</Cell>
				<Cell sortable={false}>Catégorie</Cell>
				<Cell columnId="date">
					<Label>Date</Label>
					<IconButton class="material-icons">arrow_upward</IconButton>
				</Cell>
			</Row>
		</Head>
		<Body>
			{#each events as event (event.id)}
				<Row>
					<Cell numeric>{event.id}</Cell>
					<Cell><a href="/events/{event.id}">{event.title}</a></Cell>
					<Cell>{event.category}</Cell>
					<Cell>{new Intl.DateTimeFormat('fr-Fr', {
						year: "numeric",
						month: "numeric",
						day: "numeric",
						hour: "numeric",
						minute: "numeric",
						second: "numeric",
						hour12: false,
						timeZone: 'Europe/Paris'
					}).format(event.date)}</Cell>
					
				</Row>
			{/each}
		</Body>
	</DataTable>
</main>

<style lang="scss">
	main {
		margin: 4em auto;
		width: 70%;
		min-height: 70vh;

		h2 {
			font-family: 'Ubuntu';
			margin-bottom: 0.5em;
			width: fit-content;
		}
	}
</style>