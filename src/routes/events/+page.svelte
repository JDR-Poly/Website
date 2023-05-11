<script lang="ts">
	import { error } from '$lib/stores';
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import Fab, { Icon } from '@smui/fab';
	import { goto } from '$app/navigation';
	import IconButton from '@smui/icon-button';
	import ImageB64 from '$components/ImageB64.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	async function deleteEvent(id: number) {
		const res = await fetch('/api/events/' + id, {
			method: 'DELETE'
		});
		if (res.ok) {
			location.reload();
		} else {
			const body = await res.json();
			$error = body.message;
		}
	}
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
			<div class="event">
				{#if hasRolePermission(UserPermission.MODIFY_EVENT, $page.data.user?.role)}
					<div class="delete-btn">
						<IconButton class="material-icons" on:click={() => deleteEvent(event.id)}
							>close</IconButton
						>
					</div>
				{/if}
				<div class="img">
					{#if event.imageb64}
						<ImageB64
							imageb64={event.imageb64}
							alt={`Événement ${event.title}`}
							alternativeImageSrc=""
						/>
					{/if}
				</div>
				<h3>{event.title}</h3>
				<h5>
					{new Intl.DateTimeFormat('fr-Fr', {
						dateStyle: 'medium',
						timeStyle: 'short',
						timeZone: 'Europe/Paris'
					}).format(Date.parse(event.date))}
				</h5>
				<p>{event.description}</p>
				<a href={'/events/' + event.id} class="button">Découvrir</a>
			</div>
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		min-height: 90vh;
		position: relative;
		font-family: 'Ubuntu';
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

		.event {
			background-color: $secondary;
			padding: 2em 2em 7em 2em;
			color: black;
			box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			color: #353535;
			position: relative;
			border-radius: 8px;
			max-width: 20vw;
			min-width: 260px;
			margin: 2em;
			width: 18vw;
			height: 50vh;
			min-height: 414px;

			.delete-btn {
				position: absolute;
				top: -5px;
				right: -5px;
			}

			.img {
				width: 100%;
				height: 50%;
				overflow: hidden;
				border-radius: 8px;
				position: relative;

				:global(img) {
					border-radius: 8px;
					margin: auto;
					display: block;
					position: absolute;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}

			h3 {
				margin: 15px 5px;
				letter-spacing: 0.025em;
			}

			h5 {
				margin: 0 0 0 5px;
			}

			p {
				margin-top: 20px;
				color: #827d7d;
				-webkit-line-clamp: 8;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
			}

			.button {
				display: block;
				width: 12em;
				text-decoration: none;
				cursor: pointer;
				font-size: 1.3em;
				font-weight: bold;
				letter-spacing: 2px;
				line-height: 2.75em;
				text-align: center;
				color: $secondary;
				margin: 10px 0;
				position: absolute;
				left: 50%;
				bottom: 10px;
				transform: translateX(-50%);
				border-radius: 30px;
				background: rgb(2, 29, 86);
				background: linear-gradient(
					94deg,
					rgba(2, 29, 86, 1) 0%,
					rgba(7, 48, 118, 1) 5%,
					rgba(98, 182, 235, 1) 98%
				);
			}
		}
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
