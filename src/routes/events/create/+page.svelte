<!-- @format -->
<script lang="ts">
	import { error, info, warning } from "$lib/stores";
	import Icon from "@smui/select/icon";
	import Select, { Option } from "@smui/select";
	import Textfield from "@smui/textfield";
	import { goto } from "$app/navigation";
	import Checkbox from "@smui/checkbox";
	import FormField from "@smui/form-field";
	import IB from "@smui/icon-button";
	import { categories, returnJoinEventRoles } from "$lib/evenementsUtils";
	import Compressor from "compressorjs";
	import { getBase64, getLocalDateStringOrNullFromString } from "$lib/utils";
	import ImageB64 from "$components/ImageB64.svelte";

	let title = "";
	let description = "";
	let date: string = "";
	let category = categories[0];
	let inscription = false;
	let inscription_group = "MEMBER";
	let inscription_limit: number = 16;
	let inscription_start: string = "";
	let inscription_stop: string = "";

	let images: null | FileList = null;
	let image: File | Blob;

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
				date: getLocalDateStringOrNullFromString(date),
				image: image ? await getBase64(image) : null,
				description,
				inscription,
				inscription_group,
				inscription_limit,
				inscription_start: getLocalDateStringOrNullFromString(inscription_start),
				inscription_stop: getLocalDateStringOrNullFromString(inscription_stop),
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
</script>

<svelte:head>
	<title>Créer un événement | JDRPoly</title>
	<meta name="description" content={`Créer un événement`} />
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
			<Select bind:value={category} label="Catégorie" class="small-field" required>
				<Icon class="material-icons" slot="leadingIcon">event</Icon>
				{#each categories as category}
					<Option value={category}>{category}</Option>
				{/each}
			</Select>
			<Textfield type="text" bind:value={title} label="Titre" style="width: 100%" required />
			<Textfield
				type="text"
				bind:value={description}
				label="Description"
				style="width: 100%"
				textarea
			/>

			<Textfield
				bind:value={date}
				type="datetime-local"
				label="Date"
				class="small-field"
				required
				input$min={new Date(Date.now()).toISOString().slice(0, -8)}
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
			</div>

			<FormField>
				<Checkbox
					bind:checked={inscription}
					touch
					on:change={() => {
						if (!inscription) {
							inscription_group = "MEMBER";
							inscription_start = "";
							inscription_stop = "";
							isInscriptionStop = false;
						} else {
							inscription_start = new Date(Date.now()).toString();
						}
					}}
				/>
				<span slot="label">Inscription </span>
			</FormField>

			{#if inscription}
				<Select
					bind:value={inscription_group}
					label="Rôle d'inscription"
					class="small-field"
					required
				>
					{#each returnJoinEventRoles() as role}
						<Option value={role}>{role}</Option>
					{/each}
				</Select>

				<Textfield
					bind:value={inscription_start}
					type="datetime-local"
					label="Début d'inscription"
					class="small-field"
					required
				/>

				<FormField>
					<Checkbox bind:checked={hasInscriptionLimit} touch />
					<span slot="label">Limite d'inscriptions </span>
				</FormField>

				{#if hasInscriptionLimit}
					<Textfield
						type="number"
						bind:value={inscription_limit}
						label="Limite"
						style="width: 100%"
						required
					/>
				{/if}

				<FormField>
					<Checkbox
						bind:checked={isInscriptionStop}
						touch
						on:change={() => {
							if (!isInscriptionStop) {
								inscription_stop = "";
							} else {
								inscription_stop = new Date(Date.now()).toString();
							}
						}}
					/>
					<span slot="label">Fin d'inscription </span>
				</FormField>

				{#if isInscriptionStop}
					<Textfield
						bind:value={inscription_stop}
						type="datetime-local"
						label="Fin d'inscription"
						class="small-field"
						required
						input$min={new Date(Date.now()).toISOString().slice(0, -8)}
					/>
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
			background: url("/images/events/banner.webp") center/cover;
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

	.hide-file-ui :global(input[type="file"]::file-selector-button) {
		display: none;
	}

	.hide-file-ui :global(:not(.mdc-text-field--label-floating) input[type="file"]) {
		color: transparent;
	}
</style>
