<!-- @format -->
<script lang="ts">
	import Icon from "@smui/select/icon";
	import Dialog, { Content, Title, Actions } from "@smui/dialog";
	import Button, { Label } from "@smui/button";
	import Textfield from "@smui/textfield";
	import type { Writable } from "svelte/store";
	import { error } from "$lib/stores";

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

<Dialog bind:open={$open}>
	<Title id="simple-title">Ajouter un membre d'honneur</Title>
	<Content id="list-selection-content">
		<Textfield type="text" bind:value={name} label="Nom" style="min-width: 400px;"
			><Icon class="material-icons" slot="leadingIcon">person</Icon></Textfield
		>
		<Textfield
			style="width: 100%;margin-top:20px;"
			textarea
			bind:value={description}
			label="Description"
		/>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={uploadHonorMember}>
			<Label>Ajouter</Label>
		</Button>
	</Actions>
</Dialog>
