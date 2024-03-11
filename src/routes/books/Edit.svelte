<!-- @format -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import { error } from "$lib/stores";
	import type { Book } from "$gtypes";
	import Icon from "@iconify/svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	export let book: Book;
	export let open: Writable<boolean>;
	export let statusList: string[];

	async function editBook(book: Book) {
		fetch("/api/books/", {
			method: "PATCH",
			body: JSON.stringify(book),
			headers: { "Content-Type": "application/json" },
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}
</script>

<Dialog.Root open={$open} onOutsideClick={() => ($open = false)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editer un livre</Dialog.Title>
			<Dialog.Description>Editer {book.title}</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="status" class="text-right">Disponible</Label>
				<Select.Root
					selected={{ value: book.status, label: book.status }}
					onSelectedChange={(selected) => (book.status = selected?.value)}
				>
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
				<Input id="title" bind:value={book.title} class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<div class="col-span-1 text-right">
					<Label for="caution" class="mr-1">Caution</Label>
					<Icon icon="material-symbols:payments" inline={true} class="inline" />
				</div>
				<Input id="caution" bind:value={book.caution} class="col-span-3" />
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={() => {
					$open = false;
				}}>Annuler</Button
			>
			<Button on:click={() => editBook(book)}>Modifier</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
