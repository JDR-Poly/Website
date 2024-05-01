<!-- @format -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import { error } from "$lib/stores";
	import * as Dialog from "$components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import Label from "$components/ui/label/label.svelte"; 
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import Icon from "@iconify/svelte";

	export let open: Writable<boolean>;

	// TODO: This should be a form action
	async function uploadHonorMember() {
		const data = {
			name: name,
			description: description,
		};

		fetch("/api/honormembers", {
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" },
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	let name = "";
	let description = "";
</script>
<Dialog.Root 
	open={$open}
	onOutsideClick={() => ($open = false)}
	onOpenChange={(newOpen) => {if(!newOpen && $open) {$open = false}}} 
> 
	<!-- onOpenChange is here only because clicking on the 'x' button to close the dialog doesn't update the
	store $open 
	-->
<Dialog.Content class="!max-w-4xl">
	<Dialog.Header>
		<Dialog.Title>Ajouter un membre d'honneur</Dialog.Title>
	</Dialog.Header>
	<div id="scroll-component" class="max-h-[70vh] overflow-y-scroll">
		<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
			<Label for="title">Nom</Label>
			<Input type="text" id="title" bind:value={name} />
		</div>

		<div class="grid w-11/12 gap-1.5 dialog-input-elem">
			<Label for="description">Description</Label>
			<Textarea id="description" bind:value={description} class="min-h-64"/>
		</div>
	</div>
	<Dialog.Footer>
		<Button
			on:click={() => {
				$open = false;
			}}>Annuler</Button
		>
		<Button on:click={() => {
			$open = false;
			uploadHonorMember()
		}}>Ajouter</Button>
	</Dialog.Footer>
</Dialog.Content>
</Dialog.Root>

<style lang="scss">
	.dialog-input-elem {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		margin-left: 0.5rem;
	}
</style>