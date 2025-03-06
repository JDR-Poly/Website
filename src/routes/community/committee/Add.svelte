<!-- @format -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import { error, warning } from "$lib/stores";
	import { enhance } from "$app/forms";
	import Compressor from "compressorjs";
	import * as Dialog from "$lib/components/ui/dialog";
	import type { ActionResult } from "@sveltejs/kit";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button";
	import type { FormInputEvent } from "$lib/components/ui/input";

	export let open: Writable<boolean>;
	export let categories: string[];

	let isImageProcessing = false;


	function submit(event: Event) {
    event.preventDefault(); // Prevent default browser form submission
    console.log("Submit function called!");

    const form = document.getElementById("addFormButton") as HTMLFormElement;
    console.log("Form found:", form);

    if (!form) {
        console.error("Form not found!");
        return;
    }

    const formData = new FormData(form);
    console.log("Form Data:", [...formData.entries()]); // Log all form fields

    if (!isImageProcessing) {
        console.log("Submitting form...");
        form.submit();  // Ensure it's only submitted once
        $open = false;
    } else {
        console.warn("Image is still processing!");
        $warning = "Image has not finished being compressed.";
    }
}



	function postData(data: { formData: FormData }) {
		console.log(data);
		
		return async (res: { result: ActionResult }) => {
			if (res.result.type == "success") {
				//location.reload();
			} else if (res.result.type == "failure") {
				let message = res.result.data;
				if (typeof message === "string") $error = message;
			}
		};
	}

	function onFileChange(event: FormInputEvent<Event>) {
		const inputElement = event.target as HTMLInputElement;

		if (inputElement.files && inputElement.files[0]) {
			const image = inputElement.files[0];
			if (image.size > 4e6) {
				$warning = "Image max 4MB";
				inputElement.files = null;
			} else {
				isImageProcessing = true;
				console.log("Processing image");
				new Compressor(image, {
					quality: 0.7,
					mimeType: "image/webp",
					maxWidth: 600,
					maxHeight: 600,
					async success(result) {
						console.log("Image processing finished.");
						const form = new FormData(
							document.getElementById("addFormButton") as HTMLFormElement,
						);
						form.set("image", result);
						isImageProcessing = false;
					},
					error(err) {
						console.log(err.message);
					},
				});
			}
		}
	}
</script>

<Dialog.Root open={$open} onOpenChange={(openBoolean) => {if(!openBoolean && $open != false) ($open = false)}} closeOnEscape={true}>
	<Dialog.Content>
		<form method="POST" action="?/addCommittee" use:enhance={postData} id="addFormButton" enctype="multipart/form-data">
			<Dialog.Header>
				<Dialog.Title>Ajouter un comité</Dialog.Title>
				<Dialog.Description>Ajoute une personne dans le comité d'une année.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="status" class="text-right">Catégorie</Label>
					<Select.Root>
						<Select.Trigger class="col-span-3" id="category">
							<Select.Value placeholder="Catégorie" />
						</Select.Trigger>
						<Select.Content>
							{#each categories as category}
								<Select.Item value={category}>{category}</Select.Item>
							{/each}
						</Select.Content>
						<Select.Input name="category" />
					</Select.Root>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="title" class="text-right">Titre</Label>
					<Input id="title" class="col-span-3" name="title" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Nom</Label>
					<Input id="name" class="col-span-3" name="name" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="description" class="text-right">Description</Label>
					<Input id="description" class="col-span-3" name="description" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="photo" class="text-right">Photo</Label>
					<Input
						id="photo"
						class="col-span-3"
						type="file"
						name="image"
						on:change={onFileChange}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button
					on:click={() => {
						$open = false;
					}}>Annuler</Button
				>
				<Button type="submit" on:click={submit}>Ajouter</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- submit(document.getElementById("addFormButton")) -->
