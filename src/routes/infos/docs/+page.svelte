<!-- @format -->
<script lang="ts">
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { page } from "$app/stores";
	import Add from "./Add.svelte";
	import { writable } from "svelte/store";
	import type { HonorMember } from "$gtypes";
	import { error, warning } from "$lib/stores";
	import type { PageData } from "./$types";
	import { __sortByItemOrder } from "./+page";
	import Edit from "./Edit.svelte";
	import IconButton from "$components/IconButton.svelte";

	export let data: PageData;
	const openAddDialog = writable(false);
	const openEditDialog = writable(false);

	let editedHonorMember: HonorMember | undefined = undefined;

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
		fetch("/api/honormembers", {
			method: "PATCH",
			body: JSON.stringify(honorMembers),
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
	<!-- Primary Meta Tags -->
	<title>Documents officiels | JDRPoly</title>
	<meta name="title" content="Documents officiels | JDRPoly" />
	<meta name="description" content="Règlement JDRPoly, liste des membres d'honneur, organigrame." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Documents officiels | JDRPoly" />
	<meta property="og:description" content="Règlement JDRPoly, liste des membres d'honneur, organigrame." />
</svelte:head>

<main>
	<h2>Documents officiels :</h2>

	<ul class="list-disc">
		<li><a href="/files/Règlement_Interne_2024.pdf">Règlement interne</a></li>
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
							icon="material-symbols:edit"
							action={() => {
								if (isAChange) {
									$warning = "Vous devez d'abord sauvegarder l'ordre";
									return;
								}
								editedHonorMember = honorMember;
								$openEditDialog = true;
							}}
							label={`Éditer le membre d'honneur: ${honorMember.name}`}
						/>
						<IconButton
							icon="material-symbols:delete"
							action={() =>
								fetch("/api/honormembers/" + honorMember.id, {
									method: "DELETE",
								}).then(() => location.reload())}
							label={`Supprimer le membre d'honneur ${honorMember.name}`}
						/>
						<IconButton
							icon="material-symbols:remove"
							action={() => removeOneToOrder(data.honormembers, honorMember)}
							label="Baisser l'ordre de ce membre d'honneur"
						/>
						<IconButton
							icon="material-symbols:add"
							action={() => addOneToOrder(data.honormembers, honorMember)}
							label="Augmenter l'ordre de ce membre d'honneur"
						/>
					</div>
				{/if}
			</div>
		</div>
	{/each}

	{#if isAChange && hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, $page.data.user?.role)}
		<div id="save-container">
			<IconButton
				action={() => updateOrders(data.honormembers)}
				text="Sauvegarder"
				icon="material-symbols:done"
				inline={true}
				label="Enregistrer l'ordre des membres d'honneur"
			/>
		</div>
	{/if}
</main>

{#if hasRolePermission(UserPermission.GRANT_ROLE_HONORARY_MEMBER, $page.data.user?.role)}
	<Add open={openAddDialog} />
	{#if editedHonorMember}
		<Edit open={openEditDialog} honorMember={editedHonorMember} />
	{/if}
	<div class="add-button-container">
		<IconButton
			action={() => ($openAddDialog = true)}
			icon="material-symbols:add"
			inline={true}
			label="Ajouter un membre d'honneur"
		/>
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
			position: relative;

			h3 {
				margin-bottom: 0.5em;
				text-transform: uppercase;
			}

			.admin-buttons {
				position: absolute;
				right: 40px;
				top: 0;

				:global(svg) {
					color: black;
					padding: 5px;
					font-size: 25px;
					border-radius: 25px;

					&:hover {
						background-color: lightgray;
					}
				}
			}
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

	#save-container {
		position: fixed;
		bottom: 40px;
		left: 40px;
		z-index: 3;

		:global(button) {
			background-color: limegreen;
			font-size: 20px;
			padding: 10px 15px;
			border-radius: 20px;
			color: white;
		}
	}
</style>
