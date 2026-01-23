<!-- @format -->
<script lang="ts">
	import type { PageData } from "./$types";
	import type { MembershipCode } from "$gtypes";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import DataTable from "./data-table.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Select from "$lib/components/ui/select";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	export let data: PageData;

	let codes: MembershipCode[] = data.codes;

	// Modal state
	let dialogOpen = false;
	let isSubmitting = false;

	// Form fields
	let email = "";
	let selectedPeriod: { value: string; label: string } | undefined = undefined;
	let year = new Date().getFullYear();

	const periodOptions = [
		{ value: "autumn", label: "Automne" },
		{ value: "spring", label: "Printemps" },
		{ value: "all", label: "Année complète" },
	];

	function openCreateModal() {
		// Reset form
		email = "";
		selectedPeriod = undefined;
		year = new Date().getFullYear();
		dialogOpen = true;
	}

	async function handleCreateCode() {
		if (!email || !selectedPeriod) {
			alert("Veuillez remplir tous les champs");
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch("/api/codes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					period: selectedPeriod.value,
					year,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				alert(`Erreur: ${errorData.message || "Échec de la création"}`);
			} else {
				alert("Code créé avec succès!");
				dialogOpen = false;
				// Reload the page to show the new code
				window.location.reload();
			}
		} catch (err) {
			alert("Erreur lors de la création du code");
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Codes Membres | JDR-Poly</title>
</svelte:head>

<main>
	<div class="container mx-auto py-10">
		<h2>Codes Membres :</h2>
		<DataTable {codes}>
			<div slot="actions">
				{#if hasRolePermission(UserPermission.ADMIN_PANEL, data.user?.role)}
					<Button on:click={openCreateModal}>
						Créer un code
					</Button>
				{/if}
			</div>
		</DataTable>
	</div>
</main>

<!-- Create Code Modal -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau code</Dialog.Title>
			<Dialog.Description>
				Entrez les informations pour créer un nouveau code membre.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="email" class="text-right">Email</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder="exemple@email.com"
					class="col-span-3"
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="period" class="text-right">Période</Label>
				<div class="col-span-3">
					<Select.Root bind:selected={selectedPeriod}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Sélectionner une période" />
						</Select.Trigger>
						<Select.Content>
							{#each periodOptions as option}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="year" class="text-right">Année</Label>
				<Input
					id="year"
					type="number"
					bind:value={year}
					class="col-span-3"
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" on:click={() => (dialogOpen = false)}>
				Annuler
			</Button>
			<Button on:click={handleCreateCode} disabled={isSubmitting}>
				{isSubmitting ? "Création..." : "Créer"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style lang="scss">
	main {
		margin: 4em;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 5px;
		}
	}

	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;
		z-index: 3;
		:global(button) {
			background-color: limegreen;
			border-radius: 200px;
		}

		:global(svg) {
			font-size: 60px;
		}
	}
</style>
