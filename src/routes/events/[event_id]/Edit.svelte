<script lang="ts">
	import type { Writable } from 'svelte/store';
	import Dialog, { Content, Title, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/select/icon';
	import Button, { Label } from '@smui/button';
	import { error, warning } from '$lib/stores';
	import type { Event } from '$gtypes';
	import IconButton from '@smui/icon-button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import { categories, returnJoinEventRoles } from '$lib/events';

	export let event: Event;
	let images: null | FileList = null;
	let image: File

	export let open: Writable<boolean>;

	async function editEvent() {
		const formData = new FormData();
		formData.append("title", event.title)
		formData.append("category", event.category)
		formData.append("description", event.description)
		formData.append("date", event.date.toUTCString())		
		if(image) formData.append("image", image)
		formData.append("inscription", event.inscription.toString())
		formData.append("inscription_group", event.inscription_group)
		if(hasInscriptionLimit) formData.append("inscription_limit", event.inscription_limit!.toString())
		if(event.inscription_start) formData.append("inscription_start", event.inscription_start.toUTCString())
		if(event.inscription_stop) formData.append("inscription_stop", event.inscription_stop.toUTCString())

		fetch(`/api/events/${event.id}`, {
			method: 'PATCH',
			body: formData
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	$: submitDisabled = (() => {
				if(!event.title || !event.category || !event.date) return true

				if(event.inscription && (!event.inscription_group || !event.inscription_start)) return true
				if(isInscriptionStop && (!event.inscription_stop)) return true
				return false
			})()

	//trick for bind:value for date
	let internal_date: string = event.date ? event.date.toISOString().slice(0, -8) : ""
	$: if(internal_date) event.date = new Date(Date.parse(internal_date))
	
	let internal_inscription_start: string = event.inscription_start ? event.inscription_start.toISOString().slice(0, -8) : ""
	$: if(internal_inscription_start) event.inscription_start = new Date(Date.parse(internal_inscription_start))

	let internal_inscription_stop: string = event.inscription_stop ? event.inscription_stop.toISOString().slice(0, -8) : ""
	$: if(internal_inscription_stop) event.inscription_stop = new Date(Date.parse(internal_inscription_stop))

	//Checkbot value
	let isInscriptionStop = Boolean(internal_inscription_stop)
	let hasInscriptionLimit = Boolean(event.inscription_limit)
</script>

{#if event != undefined} 
<Dialog bind:open={$open}>
	<Title id="simple-title">Editer l'événement</Title>
	<Content id="list-selection-content">
		<Select bind:value={event.category} label="Catégorie" class="small-field" required>
			<Icon class="material-icons" slot="leadingIcon">event</Icon>
			{#each categories as category}
				<Option value={category}>{category}</Option>
			{/each}
		</Select>
		<Textfield type="text" label="Titre" bind:value={event.title} style="min-width: 400px;" />
		<Textfield type="text" bind:value={event.description} label="Description" style="width: 100%" textarea/>
			
			<Textfield bind:value={internal_date} type="datetime-local" label="Date" class="small-field" required input$min={new Date(Date.now()).toISOString().slice(0, -8)}></Textfield>
			
			<div class="hide-file-ui">
				<Textfield bind:files={images} label="Image" type="file" on:change={async () => {				
					if (images && images[0]) {
						if (images[0].size > 4e+6) {
							$warning = 'Image max 4MB';
							images = null;
						} else {
							image = images[0]
						}
					}
				}}/>
				<IconButton
					class="material-icons"
					on:click={() => {
						images = null;
					}}>delete</IconButton>
			</div>

			<FormField>
				<Checkbox bind:checked={event.inscription} touch on:change={() => {		
					if(!event) return
					if(!event.inscription) {
						event.inscription_group = 'MEMBER'
						event.inscription_start = undefined
						event.inscription_stop = undefined
						isInscriptionStop = false
					} else {
						event.inscription_start = new Date(Date.now())
					}
				}}/>
				<span slot="label">Inscription </span>
			</FormField>
		
			{#if event.inscription}
				<Select bind:value={event.inscription_group} label="Rôle d'inscription" class="small-field" required>
					{#each returnJoinEventRoles() as role}
						<Option value={role}>{role}</Option>
					{/each}
				</Select>

				<Textfield bind:value={internal_inscription_start} type="datetime-local" label="Début d'inscription" class="small-field" required></Textfield>
		

				<FormField>
					<Checkbox bind:checked={hasInscriptionLimit} touch on:change={() => {
						if(hasInscriptionLimit && !event.inscription_limit) {
							event.inscription_limit = 16
						} 
					}}/>
					<span slot="label">Limite d'inscriptions </span>
				</FormField>

				{#if hasInscriptionLimit}
					<Textfield type="number" bind:value={event.inscription_limit} label="Limite" style="width: 100%" required/>
				{/if}

				<FormField>
					<Checkbox bind:checked={isInscriptionStop} touch on:change={() => {	
						if(!event) return	
						if(!isInscriptionStop) {
							event.inscription_stop = undefined
						} else {
							event.inscription_stop = new Date(Date.now())
						}
					}}/>
					<span slot="label">Fin d'inscription </span>
				</FormField>
		
				{#if isInscriptionStop}
					<Textfield bind:value={internal_inscription_stop} type="datetime-local" label="Fin d'inscription" class="small-field" required  input$min={new Date(Date.now()).toISOString().slice(0, -8)}></Textfield>
				{/if}
			{/if}

	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={editEvent} disabled={submitDisabled}>
			<Label>Modifier</Label>
		</Button>
	</Actions>
</Dialog>
{/if}

<style lang="scss">

	.hide-file-ui :global(input[type='file']::file-selector-button) {
			display: none;
	}

	.hide-file-ui :global(:not(.mdc-text-field--label-floating) input[type='file']) {
		color: transparent;
	}

	:global(#list-selection-content) > {
		:global(*:not(.mdc-form-field)) {
			margin: 10px 5px;
			width: 100%;
		}

		:global(.small-field) {
			width: 50%;
		}

		:global(.mdc-form-field) {
			display: flex;
		}
	}
	
	:global(.mdc-dialog__surface) {
		max-width: 800px !important;
		width: 80vw !important;
	}
</style>
