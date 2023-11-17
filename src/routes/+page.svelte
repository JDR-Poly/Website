<script lang="ts">
	import EventCard from '$components/EventCard.svelte';
	import Icon from '@iconify/svelte';

	import { fade } from 'svelte/transition';
	import type { Event } from '$gtypes';

	async function loadEvents() {
		return fetch('/api/events?limit=3')
			.then(async (res) => {
				return (res.ok ? await res.json() : []) as Event[];
			})
			.then((res) => {
				if(res.length > 3) res.splice(3, res.length - 3)
				return res
			})
			.catch((err) => {
				return [] as Event[];
			})
	}

</script>

<svelte:head>
	<title>Accueil | JDRPoly</title>
	<meta name="description" content="JDRPoly, jeux de rôle, lausanne, gratuit, EPFL, étudiants, agepoly, comission">
</svelte:head>

<main>
	<div id="banner">
		<img src="/images/main/banner.webp" alt="banière jdrpoly" />
		<div id="banner-text" in:fade>
			<h2>JDRPoly</h2>
			<p>Le jeu de rôle <br /> à l'<strong>EPFL</strong></p>
			<footer>
				<a href="#main" id="button">Découvrir</a>
			</footer>
		</div>
	</div>
	<div id="main">
		<header>
			<div class="double-lines" />
			<Icon icon="material-symbols:polymer" style="font-size: 32px;" class="icon"/>
			<div class="double-lines" />
			<h2>Qu'est-ce que JDRPoly ?</h2>
			<p>
				JDR-Poly est une commission de l'AGEPoly, l'association générale des étudiants
				de l'EPFL. Notre but est avant tout de promouvoir le jeu de rôle et d'organiser divers
				événements au cours de l'année à destination de tous. Une bonne partie d'entre eux se
				déroulent le mercredi soir dans le bâtiment <a href="/plan">INM</a>. <br>Le plus emblématique se
				déroule toutes les deux semaines, il s'agit des bonnes vieilles nocturnes d'initiation. Il
				existe de nombreuses autres activités proposées, allant de la simple mais ludique soirée
				Loup-garou ambiancée aux fameuses murder parties. Que vous soyez débutant intrigué par cet
				étrange loisir ou vétéran voulant se détendre de temps en temps, nous serons ravis de vous
				accueillir !<br><br>

				Toute personne qui le désire peut devenir membre de JDR-Poly, moyennant une cotisation semestrielle de 5CHF. Être membre de JDR-Poly offre plusieurs avantages exclusifs tels que l'accès à nos événements et soirées réservées aux membres (soirées jeux de sociétés, loups-garous ambiancés, GNs, Murder Parties, etc.), la possibilité de consulter et d'emprunter les livres de nôtre bibliothèque, un accès à nôtre serveur Discord et plus encore !
			</p>
		</header>
		<div id="events">
			<div id="title">Événements</div>
			{#await loadEvents()}
				<h1>Chargement...</h1>
			{:then events} 
				{#if events.length == 0}
					<h1>Il n'y a aucun événement prévu pour le moment</h1>
				{/if}
				{#each events as event}
					<EventCard {event}></EventCard>
				{/each}
			{/await}
			
		</div>
	</div>
</main>

<style lang="scss">
	#banner {
		position: relative;
		overflow: hidden;

		img {
			width: 100%;
			height: 65vh;
			object-fit: cover;
			object-position: 80% 100%;
		}

		#banner-text {
			//animation: fadeIn 2s;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(52, 27, 43, 0.5);
			color: $secondary;
			display: inline-block;
			padding: 3em 4em 3em 4em;
			text-align: center;

			h2 {
				border-top: solid 2px $secondary;
				border-bottom: solid 2px $secondary;
				padding: 0.4em;
				font-size: 43px;
				font-family: 'Playfair Display';
			}

			p {
				letter-spacing: 0.2em;
				margin-top: 1.3em;
				margin-bottom: 2em;
				font-size: 22px;
				line-height: 1.6em;
				text-transform: uppercase;
				font-weight: 550;
			}

			#button {
				color: $secondary;
				width: 100%;
				display: block;
				text-decoration: none;
				cursor: pointer;
				font-size: 1.1em;
				font-weight: 900;
				letter-spacing: 2px;
				line-height: 3.75em;
				text-align: center;
				border: 1px solid $secondary;

				&:hover {
					background: rgba(188, 202, 206, 0.15);
				}
			}
		}
	}

	#main {
		background-image: url('/images/main/dark-tl.svg'), url('/images/main/dark-tr.svg'),
			url('/images/main/dark-bl.svg'), url('/images/main/dark-br.svg');
		background-position: top left, top right, bottom left, bottom right;
		background-repeat: no-repeat;
		background-size: 25em;
		padding: 7em 0 0 0;
		background-color: $secondary;
	}

	header {
		position: relative;
		color: #7c8081;
		margin: 0 20% 12em 20%;

		.double-lines {
			border-bottom: solid 1.5px;
			border-top: solid 1.5px;
			height: 7px;
			opacity: 0.1;
			position: absolute;
			top: 1.75em;
			width: 43%;

			&:not(:first-child) {
				right: 0;
			}
		}

		:global(.icon) {
			position: absolute;
			top: 0.4em;
			left: 50%;
			transform: translateX(-50%);
			font-size: 40px;
		}

		h2 {
			padding-top: 4em;
			text-align: center;
			font-size: 1.5em;
			letter-spacing: 0.1em;
			color: inherit;
			font-weight: 300;
			line-height: 1.75em;
			margin-bottom: 1em;
			text-transform: uppercase;
		}

		p {
			text-align: justify;
			white-space: normal;
			line-height: 29px;
			letter-spacing: 0.15em;
		}
	}

	#events {
		display: flex;
		justify-content: space-evenly;
		margin: 8em 0 0 0;
		min-height: 30vh;
		padding: 8em 7%;
		background: rgb(0, 2, 26);
		background: linear-gradient(
			135deg,
			rgba(0, 2, 26, 1) 0%,
			rgba(0, 12, 56, 1) 34%,
			rgba(2, 28, 85, 1) 57%,
			rgba(7, 48, 118, 1) 85%,
			rgba(21, 137, 209, 1) 100%
		);

		position: relative;
		flex-wrap: wrap;

		h1 {
			color: $secondary;
			margin-top: 2em;
			text-align: center;
		}

		#title {
			position: absolute;
			left: 50%;
			text-align: center;
			text-transform: uppercase;
			font-weight: 700;
			letter-spacing: 0.25em;
			font-size: 1.3em;
			width: min(25em, 100%);
			height: 3.25em;
			top: -3.25em;
			line-height: 3.25em;
			padding-top: 0.7em;
			color: $secondary;
			background-color: #000c37;
			transform: translateX(-50%);
		}

	}

	//Media screen size

	@media screen and (max-width: 1500px) {
		#events {
			padding: 8em 2%;
		}
	}



	@media screen and (max-width: 1100px) {
		#banner #banner-text *:not(:first-child) {
			display: none;
		}
	}

	@media screen and (max-width: 600px) {
		header p {
			margin: 0;
		}
	}

	//Animation
	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
