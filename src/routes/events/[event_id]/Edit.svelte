<!-- @format -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import { categories, returnJoinEventRoles } from "$lib/evenementsUtils";
	import {
		getBase64,
		getTranslatedRoleName,
	} from "$lib/utils";
	import Compressor from "compressorjs";
	import { error, warning } from "$lib/stores";
	import type { Event } from "$gtypes";
	import * as Select from "$lib/components/ui/select";
	import * as Dialog from "$components/ui/dialog";
	import Label from "$components/ui/label/label.svelte"; 
	import type { Selected } from "bits-ui";
	import { Button } from "$lib/components/ui/button";
	import { Input, type FormInputEvent } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { DateInput } from 'date-picker-svelte';
	import Checkbox from "$components/ui/checkbox/checkbox.svelte";

	export let event: Event;

	const selectOption: Selected<string>[] = categories.map((v) => {return {value: v, label: v}})
	export let open: Writable<boolean>;

	let image: File | Blob | undefined;
	let isImageProcessing = false;
	async function handleImageChange(value: FormInputEvent) {
		const images = (value.target as HTMLInputElement).files
		if (images && images[0]) {
			if (images[0].size > 4e6) {
				$warning = "Image max 4MB";
				(value.target as HTMLInputElement).value = ""
				image = undefined;
			} else {
				isImageProcessing = true;
				console.log("Processing image");

				new Compressor(images[0], {
					quality: 0.6,
					mimeType: "image/webp",
					maxWidth: 1536,
					maxHeight: 864,
					async success(result) {
						console.log("Image processing finished.");
						image = result;
						isImageProcessing = false;
					},
					error(err) {
						(value.target as HTMLInputElement).value = ""
						$error = "An error occured, see console"
						console.error(err.message);
					},
				});
			}
		}
	}

	async function submit() {
		if (isImageProcessing) {
			$warning = "L'image est en cours de traitement. Attendez 5 secondes et recommencez.";
			return;
		}

		fetch(`/api/events/${event.id}`, {
			method: "PATCH",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: event.title,
				category: event.category,
				date: internal_date,
				description: event.description,
				image: image ? await getBase64(image) : undefined,
				inscription: event.inscription,
				inscription_group: event.inscription_group,
				inscription_limit: event.inscription_limit,
				inscription_start: event.inscription_start,
				inscription_stop: event.inscription_stop,
			}),
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	$: submitDisabled = (() => {
		if (!event.title || !event.category || !event.date) return true;

		if (event.inscription && (!event.inscription_group || !event.inscription_start)) return true;
		if (hasInscriptionStop && !event.inscription_stop) return true;
		return false;
	})();

	/**
	 * Internal dates are here because dates of the Event object are of type string
	 * instead of a type Date.
	 **/ 
	let internal_date: Date = new Date(Date.parse(event.date))
	$: internal_date ? event.date = internal_date.toISOString() : undefined;

	let internal_inscription_start: Date | null = event.inscription_start
		? new Date(Date.parse(event.inscription_start))
		: null;
	$: internal_inscription_start ? event.inscription_start = internal_inscription_start.toISOString() : undefined;

	let internal_inscription_stop: Date | null = event.inscription_stop
		? new Date(Date.parse(event.inscription_stop))
		: null;
	$: internal_inscription_stop ? event.inscription_stop = internal_inscription_stop.toISOString() : undefined;

	//Checkbox value
	let hasInscriptionStop = Boolean(internal_inscription_stop);
	let hasInscriptionLimit = Boolean(event.inscription_limit);
</script>

{#if event != undefined}
	<Dialog.Root 
		open={$open}
		onOutsideClick={() => ($open = false)}
		onOpenChange={(newOpen) => {if(!newOpen && $open) {$open = false}}} 
	> 
	<!-- onOpenChange is here only because clicking on the 'x' button to close the dialog doesn't update the
		store $open 
	-->
		<Dialog.Content class="!max-w-4xl h-[95%]">
			<Dialog.Header>
				<Dialog.Title>Editer l'événement</Dialog.Title>
			</Dialog.Header>
			<div id="scroll-component" class="overflow-y-scroll overflow-x-clip">
				<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
					<Label for="category">Catégorie</Label>
					<Select.Root 
						selected={selectOption.find((v) => v.value == event.category)}
						>
						<Select.Trigger class="w-[180px] dialog-input-elem" id="category">
						<Select.Value placeholder="Catégorie" />
						</Select.Trigger>
						<Select.Content>
							{#each selectOption as selectCategory}
								<Select.Item value={selectCategory.value}>{selectCategory.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
					<Label for="title">Titre</Label>
					<Input type="text" id="title" bind:value={event.title} />
				</div>

				<div class="grid w-11/12 gap-1.5 dialog-input-elem">
					<Label for="description">Description</Label>
					<Textarea id="description" bind:value={event.description} class="min-h-64"/>
				</div>

				<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
					<Label for="date">Date</Label>
					<DateInput bind:value={internal_date} min={new Date(Date.now())} timePrecision="minute" id="date" closeOnSelection/>
				</div>

				<div class="grid w-full max-w-sm items-center gap-1.5 dialog-input-elem">
					<Label for="image">Image</Label>
					<Input id="image" type="file" on:change={handleImageChange}/>
				</div>
				
				<div class="flex items-center space-x-2 dialog-input-elem">
					<Checkbox id="inscription-checkbox" bind:checked={event.inscription} />
					<Label for="inscription-checkbox"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Inscription</Label>
				</div>

				{#if event.inscription} 
					<div class="grid w-full gap-1.5 dialog-input-elem">
						<Label for="inscription-group">Rôle d'inscription</Label>
						<Select.Root 
							selected={event.inscription_group ? {label: getTranslatedRoleName(event.inscription_group), value: event.inscription_group} : undefined}
							>
							<Select.Trigger class="w-[180px]" id="inscription-group">
							<Select.Value placeholder="Rôle d'inscription" />
							</Select.Trigger>
							<Select.Content>
								{#each returnJoinEventRoles() as role}
									<Select.Item value={role}>{getTranslatedRoleName(role)}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>	

					<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
						<Label for="inscription_start">Début d'inscription</Label>
						<DateInput bind:value={internal_inscription_start} timePrecision="minute" id="inscription_start" closeOnSelection/>
					</div>

					<div class="flex items-center space-x-2 dialog-input-elem">
						<Checkbox id="inscription-limit-checkbox" 
							bind:checked={hasInscriptionLimit} 
							on:click={() => {
								if (hasInscriptionLimit && !event.inscription_limit) {
									event.inscription_limit = 16;
								} else if (!hasInscriptionLimit) {
									event.inscription_limit = undefined;
								}
							}}
						/>
						<Label for="inscription-limit-checkbox"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>Limite d'inscriptions</Label>
					</div>

					{#if hasInscriptionLimit}
						<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
							<Label for="inscription-limit">Nombre d'inscription</Label>
							<Input type="number" id="inscription-limit" bind:value={event.inscription_limit} />
						</div>
					{/if}

					<div class="flex items-center space-x-2 dialog-input-elem">
						<Checkbox id="inscription-stop-checkbox" 
							bind:checked={hasInscriptionStop} 
							on:click={() => {
								if (!hasInscriptionStop) {
									event.inscription_stop = undefined;
								} else {
									event.inscription_stop = new Date(Date.now()).toISOString();
								}
							}}
						/>
						<Label for="inscription-stop-checkbox"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>Fin d'inscription</Label>
					</div>

					{#if hasInscriptionStop}
						<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
							<Label for="inscription-stop">Date de fin d'inscription</Label>
							<DateInput bind:value={internal_inscription_stop} timePrecision="minute" id="inscription-stop" closeOnSelection/>
						</div>
					{/if}

				{/if}
			</div>
			<Dialog.Footer>
				<Button
					on:click={() => {
						$open = false;
					}}>Annuler</Button
				>
				<Button on:click={() => {
					$open = false;
					submit()
				}} disabled={submitDisabled}>Modifier</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

{/if}

<style lang="scss">
	:root {
		--date-input-width: fit-content; //Makes date input take more width space
	}

	.dialog-input-elem {
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
		margin-left: 0.5rem;
	}
</style>