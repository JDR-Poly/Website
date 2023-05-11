<script lang="ts">
	import { Panel, Header, Content } from '@smui-extra/accordion';
	import Fab, { Label, Icon } from '@smui/fab';
	import { error } from '$lib/stores';
	import type { Committee } from '$gtypes';
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import IconButton from '@smui/icon-button';
	import { onMount } from 'svelte';
	import ImageB64 from '$components/ImageB64.svelte';

	export let category: string;
	export let defaultOpen: boolean;

	let open = defaultOpen
	let isAChange = false;
	let hasFetched = false //Prevent fetching every time the category is opened
	let hasBeenMounted = false

	let committees: Committee[] = []

	onMount(() => {
		hasBeenMounted = true
	})

	async function fetchCommittees() {
		if(hasFetched) return		
		const res = await fetch('/api/committee/categories/' + category);
		const body = await res.json();
		hasFetched = true
		if(res.ok) committees = [...sortByItemOrder(body)]
		else {
			$error = body.message
		}
	} 

	$: {
		if(hasBeenMounted && open) fetchCommittees() 
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
		committees = [...sortByItemOrder(committeesParam)]
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
		committees = [...sortByItemOrder(committeesParam)]
	}

	async function updateOrders(committees: Committee[]) {
		const committesWithoutImages = committees
		committesWithoutImages.forEach(committee => {
			committee.imageb64 = undefined
		});
		fetch('/api/committee', {
			method: 'PATCH',
			body: JSON.stringify(committesWithoutImages)
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {				
				$error = err.message;
			});
	}
</script>
<Panel {open} on:SMUIAccordionPanel:opening={() => {open = true}} on:SMUIAccordionPanel:closing={() => {open = false}}>
<Header>{category}</Header>

<Content>

<div class="grid">
	{#each committees as committee, i}
		<div class="card">
			<ImageB64 imageb64={committee.imageb64} alt={committee.name ? committee.name : ""} alternativeImageSrc="/images/default/committee.png" />
			<div class="text-container">
				<h4><b>{committee.name}</b></h4>
				<p>{committee.title}</p>
			</div>
			<div class="overlay">
				<div class="text">{committee.description}</div>
			</div>
			{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
				<div class="itemorder">
					<IconButton
						class="material-icons"
						on:click={() =>
							fetch('/api/committee/' + committee.id, {
								method: 'DELETE'
							}).then(() => location.reload())}
					>
						delete
					</IconButton>
					<IconButton
						class="material-icons"
						on:click={() => removeOneToOrder(committees, committee)}
					>
						remove
					</IconButton>
					<IconButton
						class="material-icons"
						on:click={() => addOneToOrder(committees, committee)}
					>
						add
					</IconButton>
				</div>
			{/if}
		</div>
	{/each}
</div>
		
{#if isAChange && hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
	<Fab
		id="fab-container"
		color="secondary"
		on:click={() => updateOrders(committees)}
		extended
	>
		<Icon class="material-icons">done</Icon>
		<Label>Sauvegarder</Label>
	</Fab>
{/if}
</Content>
</Panel>

<style lang="scss">

	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.card {
		box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
		margin: 1em 1em;
  		transition: 0.3s;
		width: 384px;
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
		}

		.overlay {
			position: absolute;
			bottom: 100%;
			left: 0;
			right: 0;
			background-color: #03245f;
			overflow: hidden;
			width: 100%;
			height:0;
			transition: .5s ease;

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
			:global(.mdc-icon-button) {
				color: white;
				transition: .5s ease;
			}
		}
	}

	:global(#fab-container > *) {
		color: $secondary;
	}
	:global(#fab-container ) {
		background-color: limegreen;
	}

	@media only screen and (max-width: 600px) {
		.itemorder {
			top: 10px;
		}
	}
</style>
