<!-- @format -->
<script lang="ts">
	import type { Event } from "$gtypes";
	import ImageB64 from "./ImageB64.svelte";

	export let event: Event;

	let regexExpr: RegExp = /(\n){2,}/g;
</script>

<div class="event">
	<div class="img">
		{#if event.imageb64}
			<ImageB64 imageb64={event.imageb64} alt={`Événement ${event.title}`} alternativeImageSrc="" />
		{/if}
	</div>
	<h3>{event.title}</h3>
	<h5>
		{new Intl.DateTimeFormat("fr-Fr", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "Europe/Paris",
		}).format(Date.parse(event.date))}
	</h5>
	<p>{event.description ? event.description.replaceAll(regexExpr, "\n") : ""}</p>
	<a href={"/events/" + event.id} class="button">Découvrir</a>
</div>

<style lang="scss">
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
		height: 55vh;
		min-height: 500px;

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
			font-size: 1.2rem;
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
</style>
