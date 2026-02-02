<!-- @format -->
<script lang="ts">
	import type { PageData } from "./$types";
	import type { MembershipCode, Semesters } from "$gtypes";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import DataTable from "./data-table.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Select from "$lib/components/ui/select";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { error, info, warning } from "$lib/stores";
	import { invalidateAll } from "$app/navigation";
	import { validateEmail } from "$lib/validate";
	import { Period, periodFromYearSemesters } from "$lib/publicMemberPeriod";

	export let data: PageData;

	$: codes = data.codes;

	// Modal state
	let dialogOpen = false;
	let isSubmitting = false;

	// Are we in start or end of year
	const now = new Date(Date.now());
	const is_first_year_half: boolean = now.getMonth() <= 6;
	const show_1_period: boolean = is_first_year_half && now.getMonth() > 0;

	// Form fields
	let email = "";
	let selectedPeriod: { value: number, label: string } | undefined = undefined;

	//Post parameters
	const year = now.getFullYear() + (is_first_year_half ? -1 : 0);
	let semesters: Semesters;
	$: semesters = show_1_period ? 'spring' : (selectedPeriod?.value === 2 ? 'all' : 'autumn');
	$: period_dates = periodFromYearSemesters(year, semesters);

	const dateFormater = new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "short",
		timeZone: "Europe/Paris",
	});

	const periodOptions = show_1_period ? [
		{ value: 1, label: "1 Semestre" }
	] : [
		{ value: 1, label: "1 Semestre" },
		{ value: 2, label: "2 Semestres" },
	];

	function openCreateModal() {
		// Reset form
		email = "";
		selectedPeriod = periodOptions[periodOptions.length - 1];
		dialogOpen = true;
	}

	async function handleCreateCode() {
		if (!email || !selectedPeriod) {
			$warning = "Veuillez remplir tous les champs";
			return;
		}

		if (!validateEmail(email)) {
			$warning = "Veuillez rentrer un email valide";
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
					semesters,
					year,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				$error = `Erreur: ${errorData.message || "Échec de la création"}`;
			} else {
				dialogOpen = false;
				// Reload the page to show the new code
				invalidateAll();
				if (response.status === 201)
					$info = "Code envoyé avec succès!";
				else
					$info = "Statut membre octroyé directement!";
			}
		} catch (err) {
			$error = "Erreur lors de la création du code";
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
		{#key codes}
			<DataTable {codes}>
				<div slot="actions">
					{#if hasRolePermission(UserPermission.GRANT_ROLE_MEMBER, data.user?.role)}
						<Button on:click={openCreateModal}>
							Envoyez un code membre
						</Button>
					{/if}
				</div>
			</DataTable>
		{/key}
	</div>
</main>

<!-- Create Code Modal -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Envoyez un nouveau code</Dialog.Title>
			<Dialog.Description>
				Entrez les informations pour envoyer un nouveau code membre.
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
				<Label for="period" class="text-right">Semestres</Label>
				<div class="col-span-3">
					<Select.Root bind:selected={selectedPeriod}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Sélectionner les semestres"/>
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
			<div class="flex items-center justify-end space-x-4 py-4">
				<Label class="text-right">{dateFormater.format(period_dates.start)} - {dateFormater.format(period_dates.stop)}</Label>
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
</style>
