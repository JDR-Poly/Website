<!-- @format -->
<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import { error } from "$lib/stores";
	import type { Committee } from "$gtypes";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { onMount } from "svelte";
	import ImageB64 from "$components/ImageB64.svelte";
	import IconButton from "$components/IconButton.svelte";
	import type { Writable } from "svelte/store";
	import type { PageData } from "./$types";

	export let data: PageData;
	export let category: string;
	export let openAccordions: Writable<string[]>

	let isAChange = false;
	let hasFetched = false; //Prevent fetching every time the category is opened
	let hasBeenMounted = false;

	let committees: Committee[] = [];

	onMount(() => {
		hasBeenMounted = true;
	});

	async function fetchCommittees() {
		if (hasFetched) return;
		const res = await fetch("/api/committee/categories/" + category);
		const body = await res.json();
		hasFetched = true;
		if (res.ok) committees = [...sortByItemOrder(body)];
		else {
			$error = body.message;
		}
	}

	$: {
		if (hasBeenMounted && $openAccordions.includes(category)) fetchCommittees();
	}

	function sortByItemOrder(committees: Committee[]) {
		return committees.sort((a, b) => (a.item_order >= b.item_order ? 1 : -1));
	}

	function addOneToOrder(committeesParam: Committee[], current_committee: Committee) {
		//Change the order of the committes
		const nextCommittee = committees.filter((v: any) => {
			return v.item_order === current_committee.item_order + 1;
		});

		if (nextCommittee.length < 1) return;

		nextCommittee.forEach((v: any) => {
			v.item_order--;
		});

		current_committee.item_order++;
		isAChange = true;
		committees = [...sortByItemOrder(committeesParam)];
	}

	function removeOneToOrder(committeesParam: Committee[], current_committee: Committee) {
		//Change the order of the committes
		const nextCommittee = committees.filter((v: any) => {
			return v.item_order === current_committee.item_order - 1;
		});

		if (nextCommittee.length < 1) return;

		nextCommittee.forEach((v: any) => {
			v.item_order++;
		});

		current_committee.item_order--;
		isAChange = true;
		committees = [...sortByItemOrder(committeesParam)];
	}

	async function updateOrders(committees: Committee[]) {
		const committesWithoutImages = committees;
		committesWithoutImages.forEach((committee) => {
			committee.imageb64 = undefined;
		});
		fetch("/api/committee", {
			method: "PATCH",
			body: JSON.stringify(committesWithoutImages),
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}

	function onTrigger() {
		if($openAccordions.includes(category)) {
			$openAccordions = $openAccordions.filter((str) => str !== category)
		} else {
			$openAccordions = [...$openAccordions, category]
		}
	}
</script>

<Accordion.Item value={category} >
    <Accordion.Trigger on:click={onTrigger}>{category}</Accordion.Trigger>
    <Accordion.Content>
		
		<div class="grid">
			{#each committees as committee, i}
				<div class="card">
					<ImageB64
						imageb64={committee.imageb64}
						alt={committee.name ? committee.name : ""}
						alternativeImageSrc="/images/default/committee.png"
					/>
					<div class="text-container">
						<h4><b>{committee.name}</b></h4>
						<p>{committee.title}</p>
					</div>
					<div class="overlay">
						<div class="text">{committee.description}</div>
					</div>
					{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, data.user?.role)}
						<div class="itemorder">
							<IconButton
								icon="material-symbols:delete"
								action={() =>
									fetch("/api/committee/" + committee.id, {
										method: "DELETE",
									}).then(() => location.reload())}
								label={`Supprimer le comité ${committee.name} de l'année ${committee.category}`}
							/>
							<IconButton
								icon="material-symbols:remove"
								action={() => removeOneToOrder(committees, committee)}
								label="Augmenter l'ordre de ce comité"
							/>
							<IconButton
								icon="material-symbols:add"
								action={() => addOneToOrder(committees, committee)}
								label="Baisser l'ordre de ce comité"
							/>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if isAChange && hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, data.user?.role)}
			<div id="save-container">
				<IconButton
					action={() => updateOrders(committees)}
					text="Sauvegarder"
					icon="material-symbols:done"
					inline={true}
					label="Enregistré l'ordre du comité"
				/>
			</div>
		{/if}
	</Accordion.Content>
</Accordion.Item>


<style lang="scss">
	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.card {
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
		margin: 1em 1em;
		transition: 0.3s;
		width: 328px;
		position: relative;

		:global(img) {
			object-fit: cover;
			width: 100%;
			aspect-ratio: 1/ 1;
		}
		.text-container {
			padding: 8px 16px;

			h4 {
				font-size: 20px;
			}
			p {
				font-size: 17px;
				letter-spacing: 0.05em;
			}
		}

		.itemorder {
			position: absolute;
			bottom: 10px;
			right: 10px;
			display: block;

			:global(svg) {
				color: black;
				padding: 5px;
				font-size: 25px;
				border-radius: 25px;
				transition: 0.5s ease;

				&:hover {
					background-color: lightgray;
				}
			}
		}

		.overlay {
			position: absolute;
			bottom: 100%;
			left: 0;
			right: 0;
			background-color: #03245f;
			overflow: hidden;
			width: 100%;
			height: 0;
			transition: 0.5s ease;

			.text {
				color: white;
				font-size: 15px;
				width: 80%;
				margin: 15px auto;
				text-align: center;
				white-space: pre-line;
			}
			overflow-y: scroll;
		}

		&:hover {
			.overlay {
				bottom: 0;
				height: 100%;
			}
			:global(svg) {
				color: white !important;

				&:hover {
					background-color: black !important;
				}
			}
		}
	}

	@media only screen and (max-width: 600px) {
		.itemorder {
			top: 10px;
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
