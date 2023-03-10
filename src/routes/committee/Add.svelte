<script lang="ts">
	import Select, { Option } from '@smui/select';
	import Icon from '@smui/select/icon';
	import Dialog, { Content, Title, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import type { Writable } from 'svelte/store';
	import { warning, error } from '$lib/stores';
	import IconButton from '@smui/icon-button';
	import { getBase64 } from '$lib/utils';

	export let open: Writable<boolean>;
	export let categories: string[];

	async function uploadNewCommittee() {
		const data = {
			category: category,
			title: title,
			name: name,
			description: description,
			imgBase64
		}

		fetch('/api/committee', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((res) => {location.reload()})
			.catch((err) => {$error = err.message})
	}

	let category = categories[0];
	let title = '';
	let name = '';
	let description = '';
	let images: null | FileList = null;
	let imgBase64: string | ArrayBuffer | null | undefined = undefined;
</script>

<Dialog bind:open={$open}>
	<Title id="simple-title">Ajouter un comité</Title>
	<Content id="list-selection-content">
		<Select bind:value={category} label="Catégorie">
			<Icon class="material-icons" slot="leadingIcon">event</Icon>
			{#each categories as category}
				<Option value={category}>{category}</Option>
			{/each}
		</Select>
		<Textfield type="text" bind:value={title} label="Titre" style="min-width: 400px;" />
		<Textfield type="text" bind:value={name} label="Nom" style="min-width: 400px;"
			><Icon class="material-icons" slot="leadingIcon">person</Icon></Textfield
		>
		<Textfield
			style="width: 100%;margin-top:20px;"
			textarea
			bind:value={description}
			label="Description"
		/>
		<div class="hide-file-ui">
			<Textfield bind:files={images} label="Image" type="file" on:change={async () => {				
				if (images && images[0]) {
					if (images[0].size > 2097152) {
						$warning = 'Image max 2MB';
						imgBase64 = undefined;
						images = null;
					} else {						
						imgBase64 = await getBase64(images[0]);
					}
				}
			}}/>
			<IconButton
				class="material-icons"
				on:click={() => {
					images = null;
				}}
				>delete</IconButton
			>
		</div>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={uploadNewCommittee}>
			<Label>Ajouter</Label>
		</Button>
	</Actions>
</Dialog>

<style lang="scss">
	.hide-file-ui :global(input[type='file']::file-selector-button) {
		display: none;
	}

	.hide-file-ui :global(:not(.mdc-text-field--label-floating) input[type='file']) {
		color: transparent;
	}
</style>
