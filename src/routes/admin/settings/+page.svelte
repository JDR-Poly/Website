<!-- @format -->
<script lang="ts">
	import { info, error } from "$lib/stores";
	import { enhance, applyAction } from "$app/forms";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { Switch } from "$lib/components/ui/switch";
	import type { PageData } from "./$types";
	import { invalidateAll } from "$app/navigation";

	export let data: PageData;

	let gsheet_id = data.settings.gsheet_id;
	let gsheet_sync_enabled = data.settings.gsheet_sync_enabled;
	let code_validity_days = String(data.settings.code_validity_days);

	// Track if settings have been modified
	$: hasChanges =
		gsheet_id !== data.settings.gsheet_id ||
		gsheet_sync_enabled !== data.settings.gsheet_sync_enabled ||
		code_validity_days !== String(data.settings.code_validity_days);
</script>

<svelte:head>
	<title>Settings | JDR-Poly</title>
</svelte:head>

<main>
	<h2>Global Settings</h2>

	<form
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type == "success") {
					$info = "Settings updated successfully.";
				} else if (result.type == "failure") {
					$error = "Failed to update settings.";
				}
				await applyAction(result);
				invalidateAll();
			};
		}}
	>
		<!-- Google Sheet ID input -->
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="gsheet_id" class="text-right">Google Sheet ID</Label>
			<div class="col-span-3 max-w-md">
				<Input
					type="text"
					id="gsheet_id"
					name="gsheet_id"
					bind:value={gsheet_id}
				/>
			</div>
		</div>

		<!-- Sync enabled toggle -->
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="gsheet_sync_enabled" class="text-right">Enable Google Sheet Sync</Label>
			<div class="col-span-3 flex items-center gap-2">
				<Switch id="gsheet_sync_enabled" bind:checked={gsheet_sync_enabled} />
				<input type="hidden" name="gsheet_sync_enabled" value={gsheet_sync_enabled.toString()} />
			</div>
		</div>

		<!-- Code validity days input -->
		<div class="grid grid-cols-4 items-center gap-4">
			<Label for="code_validity_days" class="text-right"> Code Validity (days) </Label>
			<div class="col-span-3" style="max-width: 150px;">
				<Input
					type="number"
					id="code_validity_days"
					name="code_validity_days"
					bind:value={code_validity_days}
					min="1"
				/>
			</div>
		</div>

		<div class="flex justify-end">
			<Button type="submit" disabled={!hasChanges} class="w-auto">Save Settings</Button>
		</div>
	</form>
</main>

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		form {
			margin: 2em 0;
			display: flex;
			flex-direction: column;
			gap: 1.5em;
		}
	}
</style>
