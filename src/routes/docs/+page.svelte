<script lang="ts">
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Fab, { Label, Icon } from '@smui/fab';
	import type { HonorMember } from '$gtypes';
	import { error } from '$lib/stores';
	import IconButton from '@smui/icon-button';
	import type { PageData } from './$types';
	import { __sortByItemOrder } from './+page';

	export let data: PageData;
	export let openAddDialog = writable(false);

	let isAChange = false; //Indicates if there was a change and thus something can be saved

	function addOneToOrder(members: HonorMember[], selected_member: HonorMember) {
		//Change the order of the committes
		const nextMember = members.filter((v: any) => {
			return v.item_order === selected_member.item_order + 1;
		});

		if (nextMember.length < 1) return;

		nextMember.forEach((v: any) => {
			v.item_order--;
		});

		selected_member.item_order++;
		isAChange = true;
		data.honormembers = [...__sortByItemOrder(members)];
	}

	function removeOneToOrder(members: HonorMember[], selected_member: HonorMember) {
		//Change the order of the committes
		const nextMember = members.filter((v: any) => {
			return v.item_order === selected_member.item_order - 1;
		});

		if (nextMember.length < 1) return;

		nextMember.forEach((v: any) => {
			v.item_order++;
		});

		selected_member.item_order--;
		isAChange = true;
		data.honormembers = [...__sortByItemOrder(members)];
	}

	async function updateOrders(honorMembers: HonorMember[]) {
		fetch('/api/honormembers', {
			method: 'PATCH',
			body: JSON.stringify(honorMembers)
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}
</script>

<svelte:head>
	<title>Documents officiels | JDRPoly</title>
</svelte:head>

<main>
	<h2>Documents officiels :</h2>

	<ul>
		<li><a href="/files/Règlement_interne_Février_2021_Signé.pdf">Règlement interne</a></li>
		<li><a href="/files/Organigramme_2021.pdf">Organigramme</a></li>
	</ul>

	<h2>Membres d'honneur :</h2>

	{#each data.honormembers as honorMember}
		<div class="honor-member">
			<h3>{honorMember.name}</h3>
			<div>
				<p>{honorMember.description}</p>

				{#if hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, data.user?.role)}
					<div class="admin-buttons">
						<IconButton
							class="material-icons"
							on:click={() =>
								fetch('/api/honormembers/' + honorMember.id, {
									method: 'DELETE'
								}).then(() => location.reload())}
						>
							delete
						</IconButton>
						<IconButton
							class="material-icons"
							on:click={() => removeOneToOrder(data.honormembers, honorMember)}
						>
							remove
						</IconButton>
						<IconButton
							class="material-icons"
							on:click={() => addOneToOrder(data.honormembers, honorMember)}
						>
							add
						</IconButton>
					</div>
				{/if}
			</div>
		</div>
	{/each}

	{#if isAChange && hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, $page.data.user?.role)}
		<Fab
			id="fab-container"
			color="secondary"
			on:click={() => updateOrders(data.honormembers)}
			extended
		>
			<Icon class="material-icons">done</Icon>
			<Label>Sauvegarder</Label>
		</Fab>
	{/if}
</main>

{#if hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, $page.data.user?.role)}
	<Add open={openAddDialog} />
	<div class="add-button-container">
		<Fab style="width:80px;height:80px;" on:click={() => ($openAddDialog = true)}>
			<Icon class="material-icons" style="font-size:40px;">add</Icon>
		</Fab>
	</div>
{/if}

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 5px;
		}

		li {
			margin-left: 50px;
			font-size: 20px;
		}

		ul {
			margin-bottom: 4em;
		}

		.honor-member {
			margin: 2em 0;
			border-bottom: solid 2px gray;
			padding-bottom: 1em;

			h3 {
				margin-bottom: 0.5em;
				text-transform: uppercase;
			}

			.admin-buttons {
				margin-left: auto;
				width: fit-content;
			}
		}
	}

	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;

		:global(.mdc-fab) {
			--mdc-theme-secondary: limegreen;
		}
		:global(.mdc-fab__icon) {
			color: $secondary;
		}
	}

	:global(#fab-container) {
		position: fixed;
		bottom: 40px;
		left: 40px;
		background-color: limegreen;
	}

	:global(#fab-container .mdc-fab__label, #fab-container .mdc-fab__icon) {
		color: $secondary;
	}
</style>
