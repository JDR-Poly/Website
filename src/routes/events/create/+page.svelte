<script lang="ts">
	import {error, info, warning} from "$lib/stores"
	import Icon from '@smui/select/icon';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import { goto } from "$app/navigation";
	import Checkbox from '@smui/checkbox';
  	import FormField from '@smui/form-field';
	import IconButton from '@smui/icon-button';
	import { categories, returnJoinEventRoles } from "$lib/events";
		
	let title = ''
	let description = ''
	let date: string = ''
	let category = categories[0]
	let inscription = false
	let inscription_group = 'MEMBER'
	let inscription_start: string = ''
	let inscription_stop: string = ''
	
	let images: null | FileList = null;
	let image: File

	let isInscriptionStop = false //Not an actual stored value in the database
	let submitDisabled = true

	async function submit() {	
		const formData = new FormData();
		formData.append("title", title)
		formData.append("category", category)
		formData.append("description", description)
		if(date) formData.append("date", new Date(Date.parse(date)).toUTCString())
		if(image) formData.append("image", image)
		formData.append("inscription", inscription.toString())
		formData.append("inscription_group", inscription_group)
		if(inscription_start) formData.append("inscription_start", new Date(Date.parse(inscription_start)).toUTCString())
		if(inscription_stop) formData.append("inscription_stop", new Date(Date.parse(inscription_stop)).toUTCString())
		
		const res = await fetch('/api/events', {
			method: 'POST',
			body: formData
		});	
		const body = await res.json();
		if (res.ok) {			
			goto('/events/' + body.id)
			$info = "L'évènement a bien été créé"
		} else {
			$error = body.message
		}
	}
</script>

<main>
	<div id="img"></div>
	<div id="wrapper">
		<form on:change={() => {
			submitDisabled = (() => {
				if(!title || !category || !date) return true

				if(inscription && (!inscription_group || !inscription_start)) return true
				if(isInscriptionStop && (!inscription_stop)) return true
				return false
			})()
		}}>
			<Select bind:value={category} label="Catégorie" class="small-field" required>
				<Icon class="material-icons" slot="leadingIcon">event</Icon>
				{#each categories as category}
					<Option value={category}>{category}</Option>
				{/each}
			</Select>
			<Textfield type="text" name="title" bind:value={title} label="Titre" style="width: 100%" required/>
			<Textfield type="text" bind:value={description} label="Description" style="width: 100%" textarea/>
			
			<Textfield bind:value={date} type="datetime-local" label="Date" class="small-field" required input$min={new Date(Date.now()).toISOString().slice(0, -8)}></Textfield>
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
				<Checkbox bind:checked={inscription} touch on:change={() => {		
					if(!inscription) {
						inscription_group = 'MEMBER'
						inscription_start = ''
						inscription_stop = ''
						isInscriptionStop = false
					} else {
						inscription_start = new Date(Date.now()).toUTCString()
					}
				}}/>
				<span slot="label">Inscription </span>
			</FormField>
		
			{#if inscription}
				<Select bind:value={inscription_group} label="Rôle d'inscription" class="small-field" required>
					{#each returnJoinEventRoles() as role}
						<Option value={role}>{role}</Option>
					{/each}
				</Select>

				<Textfield bind:value={inscription_start} type="datetime-local" label="Début d'inscription" class="small-field" required></Textfield>
		
				<FormField>
					<Checkbox bind:checked={isInscriptionStop} touch on:change={() => {		
						if(!isInscriptionStop) {
							inscription_stop = ''
						} else {
							inscription_stop = new Date(Date.now()).toUTCString()
						}
					}}/>
					<span slot="label">Fin d'inscription </span>
				</FormField>
		
				{#if isInscriptionStop}
					<Textfield bind:value={inscription_stop} type="datetime-local" label="Fin d'inscription" class="small-field" required input$min={new Date(Date.now()).toISOString().slice(0, -8)}></Textfield>
				{/if}
			{/if}
		
			<button disabled={submitDisabled} on:click={submit}>Créer l'événement</button>		
		</form>
	</div>
	
</main>


<style lang="scss">
	main {
		min-height: 90vh;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		padding: 15px;

		#img {
			filter: blur(3px);
			background: url('/images/events/banner.webp') center/cover;
			position: absolute;
			height: 100%;
			width: 100%;
		}
	}


	#wrapper {
		width: 700px;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		padding: 72px 55px 90px;
		z-index: 1;

		form > {

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
	}

	.hide-file-ui :global(input[type='file']::file-selector-button) {
		display: none;
	}

	.hide-file-ui :global(:not(.mdc-text-field--label-floating) input[type='file']) {
		color: transparent;
	}
</style>