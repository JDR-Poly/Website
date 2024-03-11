<!-- @format -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import * as Dialog from "$lib/components/ui/dialog";
	import { error } from "$lib/stores";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import Icon from "@iconify/svelte";

	export let open: Writable<boolean>;
	export let statusList: string[];

	async function uploadNewBook() {
		const data = {
			title: title,
			caution: caution,
			status: status,
		};

		fetch("/api/books", {
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

	let title = "";
	let caution = "";
	let status = "Disponible";
</script>

<Dialog.Root open={$open} onOutsideClick={() => ($open = false)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ajouter un livre</Dialog.Title>
			<Dialog.Description>Ajoute un livre à la liste.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="status" class="text-right">Disponible</Label>
				<Select.Root>
					<Select.Trigger class="col-span-3" id="status">
						<Select.Value placeholder="Disponibilité" />
					</Select.Trigger>
					<Select.Content>
						{#each statusList as statusOption}
							<Select.Item value={statusOption}>{statusOption}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="title" class="text-right">Titre</Label>
				<Input id="title" bind:value={title} class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<div class="col-span-1 text-right">
					<Label for="caution" class="mr-1">Caution</Label>
					<Icon icon="material-symbols:payments" inline={true} class="inline" />
				</div>
				<Input id="caution" bind:value={caution} class="col-span-3" />
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={() => {
					$open = false;
				}}>Annuler</Button
			>
			<Button on:click={uploadNewBook}>Ajouter</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style lang="scss">
	:global(#list-selection-content > *) {
		margin: 0.5em;
	}
</style>
