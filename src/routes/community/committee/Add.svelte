<!-- @format -->
<script lang="ts">
	import Select, { Option } from "@smui/select";
	import Icon from "@smui/select/icon";
	import Dialog, { Content, Title, Actions } from "@smui/dialog";
	import Button, { Label } from "@smui/button";
	import Textfield from "@smui/textfield";
	import type { Writable } from "svelte/store";
	import { error, warning } from "$lib/stores";
	import IB from "@smui/icon-button";
	import { enhance } from "$app/forms";
	import Compressor from "compressorjs";
	import type { ActionResult } from "@sveltejs/kit";

	export let open: Writable<boolean>;
	export let categories: string[];

	let category = categories[0];
	let title = "";
	let name = "";
	let description = "";
	let images: null | FileList = null;
	let image: File | Blob | undefined;
	let isImageProcessing = false;

	function submit(form: any) {
		form.click();
	}

	function postData(data: { formData: FormData }) {
		data.formData.append("category", category);
		if (image) data.formData.append("image", image);
		return async (res: { result: ActionResult }) => {
			images = null;
			image = undefined;
			data.formData.delete("image");
			if (res.result.type == "success") {
				location.reload();
			} else if (res.result.type == "failure") {
				let message = res.result.data?.message;
				if (message) $error = message;
			}
		};
	}
</script>

<Dialog bind:open={$open}>
	<Title id="simple-title">Ajouter un comité</Title>
	<Content id="list-selection-content">
		<form method="POST" action="?/addCommittee" use:enhance={postData}>
			<Select bind:value={category} label="Catégorie">
				<Icon class="material-icons" slot="leadingIcon">event</Icon>
				{#each categories as category}
					<Option value={category}>{category}</Option>
				{/each}
			</Select>
			<Textfield
				input$name="title"
				type="text"
				bind:value={title}
				label="Titre"
				style="min-width: 400px;"
			/>
			<Textfield input$name="name" type="text" bind:value={name} label="Nom" style="min-width: 400px;"
				><Icon class="material-icons" slot="leadingIcon">person</Icon></Textfield
			>
			<Textfield
				input$name="description"
				style="width: 100%;margin-top:20px;"
				textarea
				bind:value={description}
				label="Description"
			/>
			<div class="hide-file-ui">
				<Textfield
					bind:files={images}
					label="Image"
					type="file"
					on:change={async () => {
						if (images && images[0]) {
							if (images[0].size > 4e6) {
								$warning = "Image max 4MB";
								images = null;
							} else {
								isImageProcessing = true;
								console.log("Processing image");
								new Compressor(images[0], {
									quality: 0.7,
									mimeType: "image/webp",
									maxWidth: 600,
									maxHeight: 600,
									async success(result) {
										console.log("Image processing finished.");
										image = result;
										isImageProcessing = false;
									},
									error(err) {
										console.log(err.message);
									},
								});
							}
						}
					}}
				/>
				<IB
					class="material-icons"
					on:click={() => {
						images = null;
					}}>delete</IB
				>
				<button type="submit" id="addFormButton" />
			</div>
		</form>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button
			on:click={() => {
				submit(document.getElementById("addFormButton"));
			}}
		>
			<Label>Ajouter</Label>
		</Button>
	</Actions>
</Dialog>

<style lang="scss">
	.hide-file-ui :global(input[type="file"]::file-selector-button) {
		display: none;
	}

	.hide-file-ui :global(:not(.mdc-text-field--label-floating) input[type="file"]) {
		color: transparent;
	}
</style>
