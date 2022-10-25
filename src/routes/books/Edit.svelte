<script lang="ts">
	import type { Writable } from 'svelte/store';
	import Dialog, { Content, Title, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/select/icon';
	import Button, { Label } from '@smui/button';
	import { error } from '$lib/stores';

	export let book: any;
	export let open: Writable<boolean>;
	export let statusList: string[];

	async function editBook() {
		fetch('/api/books/' + book.id, {
			method: 'PATCH',
			body: JSON.stringify(book),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	let tes = ' ';
</script>

<Dialog bind:open={$open}>
	<Title id="simple-title">Editer un livre</Title>
	<Content id="list-selection-content">
		<Select bind:value={book.status} label="Disponible:">
			{#each statusList as statusOption}
				<Option value={statusOption}>{statusOption}</Option>
			{/each}
		</Select>
		<Textfield type="text" label="Titre" bind:value={book.title} style="min-width: 400px;" />
		<Textfield type="text" label="Caution" bind:value={book.caution} style="min-width: 400px;">
			<Icon class="material-icons" slot="leadingIcon">payments</Icon>
		</Textfield>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={editBook}>
			<Label>Modifier</Label>
		</Button>
	</Actions>
</Dialog>
