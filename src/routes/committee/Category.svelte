<script lang="ts">
	export let category: string;
	export let open: boolean;
	import { Panel, Header, Content } from '@smui-extra/accordion';
	import Fab, { Label, Icon } from '@smui/fab';
	import { error } from '$lib/stores';
	import type { Committee } from 'src/types';
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import IconButton from '@smui/icon-button';

	let change = false;

	let reqCommittees = fetch('/api/committee/categories/' + category)
		.then(async (res) => {
			return await res.json();
		})
		.then((res) => {
			return sortByItemOrder(res);
		})
		.catch((err) => {
			$error = err.message;
		});

	function sortByItemOrder(committees: any) {
		return committees.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
	}

	function addOneToOrder(committees: any, current_committee: any) {
		//Change the order of the committes
		const nextCommittee = committees.filter((v: any) => {
			return v.item_order === current_committee.item_order + 1;
		});

		if (nextCommittee.length < 1) return;

		nextCommittee.forEach((v: any) => {
			v.item_order--;
		});

		current_committee.item_order++;
		change = true;
		reqCommittees = (async () => {
			return sortByItemOrder(committees);
		})();
	}

	function removeOneToOrder(committees: any, current_committee: any) {
		//Change the order of the committes
		const nextCommittee = committees.filter((v: any) => {
			return v.item_order === current_committee.item_order - 1;
		});

		if (nextCommittee.length < 1) return;

		nextCommittee.forEach((v: any) => {
			v.item_order++;
		});

		current_committee.item_order--;
		change = true;
		reqCommittees = (async () => {
			return sortByItemOrder(committees);
		})();
	}

	async function updateOrders(committees: Committee[]) {
		fetch('/api/committee', {
			method: 'PATCH',
			body: JSON.stringify(committees)
		})
			.then(() => {
				location.reload();
			})
			.catch((err) => {
				$error = err.message;
			});
	}
</script>

<Panel {open}>
	<Header>{category}</Header>

	<Content>
		{#await reqCommittees}
			<!---->
		{:then committees}
			{#each committees as committee, i}
				<div class="committee" style:border-top={i == 0 ? '' : 'solid 2px #e5e5e5'}>
					{#if hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
						<div class="item_order">
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

					<h2>{committee.title}</h2>
					<h3>{committee.name}</h3>
					<div class="committee-info">
						<div class="flex-component">
							<img src={'/committee/' + committee.id + '.png'} alt="" />
						</div>
						<div class="flex-component"><p>{committee.description}</p></div>
					</div>
				</div>
			{/each}
			{#if change && hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, $page.data.user?.role)}
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
		{/await}
	</Content>
</Panel>

<style lang="scss">
	:root {
		--mdc-theme-secondary: limegreen;
	}

	.committee {
		margin: 10px;
		position: relative;
	}

	.item_order {
		position: absolute;
		top: 10px;
		right: 10px;
		display: block;
	}

	h2 {
		font-size: 1.65em;
		font-weight: 400;
		letter-spacing: 2px;
		margin: 0 0 0.75em 0;
		line-height: 1.75em;
	}

	h3 {
		margin: 0;
	}

	.committee-info {
		display: flex;
		align-items: center;
		padding: 2em;

		.flex-component {
			img {
				max-width: 180px;
				max-height: 180px;
				margin-right: 70px;
			}

			p {
				white-space: pre-line;
				width: 70%;
				margin: 0;

			}
		}
	}
</style>
