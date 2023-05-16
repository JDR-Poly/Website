<script lang="ts">
	import type { Writable } from 'svelte/store';
	import Dialog, { Content, Title, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/select/icon';
	import Button, { Label } from '@smui/button';
	import { error } from '$lib/stores';
	import type { HonorMember } from '$gtypes';

	export let honorMember: HonorMember;
	export let open: Writable<boolean>;

	async function editHonorMember() {
		fetch('/api/honormembers/', {
			method: 'PATCH',
			body: JSON.stringify(honorMember),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((res) => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}
</script>

<Dialog bind:open={$open}>
	<Title id="simple-title">Editer un membre d'honneur</Title>
	<Content id="edit-content">
		<Textfield type="text" label="Nom" bind:value={honorMember.name} style="min-width: 400px;" />
		<Textfield type="text" label="Description" bind:value={honorMember.description} style="min-width: 400px;" textarea>
		</Textfield>
	</Content>
	<Actions>
		<Button>
			<Label>Annuler</Label>
		</Button>
		<Button on:click={editHonorMember}>
			<Label>Modifier</Label>
		</Button>
	</Actions>
</Dialog>

<style lang="scss">
	:global(.mdc-dialog__surface) {
		max-width: 600px !important;
		width: 80vw !important;
	}
	:global(.mdc-text-field) {
		margin: 1em 0 1em 0;
	}
</style>