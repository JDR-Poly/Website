<!-- @format -->
<script lang="ts">
	import { error, info, warning } from "$lib/stores";
	import { categories, returnJoinEventRoles } from "$lib/evenementsUtils";
	import Compressor from "compressorjs";
	import { getBase64, getTranslatedRoleName } from "$lib/utils";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import * as Select from "$lib/components/ui/select";
	import Label from "$components/ui/label/label.svelte"; 
	import { Button } from "$lib/components/ui/button";
	import { Input, type FormInputEvent } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { DateInput } from 'date-picker-svelte';
	import Checkbox from "$components/ui/checkbox/checkbox.svelte";

	let title = "";
	let description = "";
	let date: Date = new Date(Date.now());
	let category = categories[0];
	let image: File | Blob | undefined;
	let inscription = false;
	let inscription_group: string = "MEMBER";
	let inscription_limit: number | undefined = undefined;
	let inscription_start: Date | undefined = undefined;
	let inscription_stop: Date | undefined = undefined;

	//Not actual stored values in the database
	let isInscriptionStop = false;
	let hasInscriptionLimit = false;
	let submitDisabled = true;
	let isImageProcessing = false;

	async function submit() {
		if (isImageProcessing) {
			$warning = "L'image est en cours de traitement. Attendez 5 secondes et recommencez.";
			return;
		}

		fetch("/api/events", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title,
				category,
				date: date,
				image: image ? await getBase64(image) : null,
				description,
				inscription,
				inscription_group,
				inscription_limit,
				inscription_start: inscription_start,
				inscription_stop: inscription_stop,
			}),
		}).then(async (res) => {
			const body = await res.json();
			if (res.ok) {
				goto("/events/" + body.id);
				$info = "L'évènement a bien été créé";
			} else {
				$error = body.message;
			}
		});
	}


	function handleImageChange(value: FormInputEvent) {
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
						console.log(err.message);
					},
				});
			}
		}
	}
</script>
<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Créer un événement | JDRPoly</title>
	<meta name="title" content="Créer un événement | JDRPoly" />
	<meta name="description" content="Créer un événement." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Créer un événement | JDRPoly" />
	<meta property="og:description" content="Créer un événement." />
</svelte:head>

<main>
	<div id="img" />
	<div id="wrapper">
		<form
			on:change={() => {
				submitDisabled = (() => {
					if (!title || !category || !date) return true;

					if (inscription && (!inscription_group || !inscription_start)) return true;
					if (isInscriptionStop && !inscription_stop) return true;
					return false;
				})();
			}}
		>

		<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
			<Label for="category">Catégorie</Label>
			<Select.Root>
				<Select.Trigger class="w-[180px] dialog-input-elem" id="category">
				<Select.Value placeholder="Catégorie" />
				</Select.Trigger>
				<Select.Content>
					{#each categories as selectCategory}
						<Select.Item value={selectCategory}>{selectCategory}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
			<Label for="title">Titre</Label>
			<Input type="text" id="title" bind:value={title} />
		</div>

		<div class="grid w-11/12 gap-1.5 dialog-input-elem">
			<Label for="description">Description</Label>
			<Textarea id="description" bind:value={description} class="min-h-64"/>
		</div>

		<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
			<Label for="date">Date</Label>
			<DateInput bind:value={date} min={new Date(Date.now())} timePrecision="minute" id="date" closeOnSelection/>
		</div>

		<div class="grid w-full max-w-sm items-center gap-1.5 dialog-input-elem">
			<Label for="image">Image</Label>
			<Input id="image" type="file" on:change={handleImageChange}/>
		</div>
		
		<div class="flex items-center space-x-2 dialog-input-elem">
			<Checkbox id="inscription-checkbox" bind:checked={inscription} />
			<Label for="inscription-checkbox"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>Inscription</Label>
		</div>

		{#if inscription} 
			<div class="grid w-full gap-1.5 dialog-input-elem">
				<Label for="inscription-group">Rôle d'inscription</Label>
				<Select.Root 
					selected={{label: inscription_group, value: inscription_group}}
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
				<DateInput bind:value={inscription_start} timePrecision="minute" id="inscription_start" closeOnSelection/>
			</div>

			<div class="flex items-center space-x-2 dialog-input-elem">
				<Checkbox id="inscription-limit-checkbox" 
					bind:checked={hasInscriptionLimit} 
					on:click={() => {
						if (hasInscriptionLimit) {
							inscription_limit = 16;
						} else if (!hasInscriptionLimit) {
							inscription_limit = undefined;
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
					<Input type="number" id="inscription-limit" bind:value={inscription_limit} />
				</div>
			{/if}

			<div class="flex items-center space-x-2 dialog-input-elem">
				<Checkbox id="inscription-stop-checkbox" 
					bind:checked={isInscriptionStop} 
					on:click={() => {
						if (!isInscriptionStop) {
							inscription_stop = undefined;
						} else {
							inscription_stop = new Date(Date.now())
						}
					}}
				/>
				<Label for="inscription-stop-checkbox"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>Fin d'inscription</Label>
			</div>

			{#if isInscriptionStop}
				<div class="flex w-full max-w-sm flex-col gap-1.5 dialog-input-elem">
					<Label for="inscription-stop">Date de fin d'inscription</Label>
					<DateInput bind:value={inscription_stop} timePrecision="minute" id="inscription-stop" closeOnSelection/>
				</div>
			{/if}

		{/if}

			<Button disabled={submitDisabled} on:click={submit}>Créer l'événement</Button>
		</form>
	</div>
</main>

<style lang="scss">

	:root {
			--date-input-width: fit-content; //Makes date input take more width space
		}
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
			background: url("/images/events/banner.webp") center/cover;
			position: absolute;
			height: 100%;
			width: 100%;
		}

		.dialog-input-elem {
			margin-top: 1.25rem;
			margin-bottom: 1.25rem;
			margin-left: 0.5rem;
		}
	}

	#wrapper {
		width: 700px;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		padding: 72px 55px 90px;
		z-index: 1;

	}

</style>