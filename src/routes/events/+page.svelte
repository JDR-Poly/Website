<!-- @format -->
<script lang="ts">
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import EventCard from "$components/EventCard.svelte";
	import IconButton from "$components/IconButton.svelte";
	import { categories } from "$lib/evenementsUtils";
	import { page } from "$app/stores";
	export let data: PageData;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Événements | JDRPoly</title>
	<meta name="title" content="Événements | JDRPoly" />
	<meta name="description" content={`Liste des événements de JDRPoly, Catégories: ${categories}`} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Événements | JDRPoly" />
	<meta property="og:description" content={`Liste des événements de JDRPoly, Catégories: ${categories}`} />
</svelte:head>

<main>
	{#if hasRolePermission(UserPermission.CREATE_EVENT, data.user?.role)}
		<div class="add-button-container">
			<IconButton
				action={() => goto("/events/create")}
				icon="material-symbols:add"
				inline={true}
				label="Créer un événement"
			/>
		</div>
	{/if}
	{#if data.events.length == 0}
		<h1>Il n'y a aucun événement prévu pour le moment</h1>
	{/if}
	<div id="event-container">
		{#each data.events as event}
			<EventCard {event} />
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
