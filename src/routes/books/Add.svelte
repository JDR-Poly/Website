<script lang="ts">
	import Select, { Option } from '@smui/select';
	import Icon from '@smui/select/icon';
	import Dialog, { Content, Title, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import type { Writable } from 'svelte/store';
	import { error } from '$lib/stores';

	export let open: Writable<boolean>;
	export let statusList: string[];

	async function uploadNewBook() {
		const data = {
			title: title,
			caution: caution,
			status: status
		};

		fetch('/api/books', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	let title = '';
	let caution = '';
	let status = 'Disponible';
</script>

<Dialog bind:open={$open}>
	<Title id="simple-title">Ajouter un livre</Title>
	<Content id="list-selection-content">
		<Select bind:value={status} label="Disponible:">
			{#each statusList as statusOption}
				<Option value={statusOption}>{statusOption}</Option>
			{/each}
		</Select>
		<Textfield type="text" bind:value={title} label="Titre" style="min-width: 400px;" />
		<Textfield type="text" bind:value={caution} label="Caution" style="min-width: 400px;">
			<Icon class="material-icons" slot="leadingIcon">payments</Icon>
		</Textfield>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={uploadNewBook}>
			<Label>Ajouter</Label>
		</Button>
	</Actions>
</Dialog>
