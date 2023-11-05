<script lang="ts">
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import Fab, { Icon } from '@smui/fab';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import EventCard from '$components/EventCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Événements | JDRPoly</title>
</svelte:head>

<main>
	{#if hasRolePermission(UserPermission.CREATE_EVENT, data.user?.role)}
		<div class="add-button-container">
			<Fab style="width:80px;height:80px;" on:click={() => goto('/events/create')}>
				<Icon class="material-icons" style="font-size:40px;">add</Icon>
			</Fab>
		</div>
	{/if}
	{#if data.events.length == 0}
		<h1>Il n'y a aucun événement prévu pour le moment</h1>
	{/if}
	<div id="event-container">
		{#each data.events as event}
			<EventCard {event}></EventCard>
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		min-height: 90vh;
		position: relative;
		background: rgb(0, 2, 26);
		background: linear-gradient(
			135deg,
			rgba(0, 2, 26, 1) 0%,
			rgba(0, 12, 56, 1) 34%,
			rgba(2, 28, 85, 1) 57%,
			rgba(7, 48, 118, 1) 85%,
			rgba(21, 137, 209, 1) 100%
		);

		h1 {
			color: $secondary;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: block;
			font-size: 2.5rem;
		}
	}

	#event-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 4em 0;

	}

	.add-button-container {
		position: absolute;
		bottom: 40px;
		right: 40px;
		z-index: 1;

		:global(.mdc-fab__icon) {
			color: $secondary;
		}

		:global(*) {
			--mdc-theme-secondary: limegreen;
		}
	}
</style>
