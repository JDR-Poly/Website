<script lang="ts">
	import { fade } from 'svelte/transition';

	export let data: any;
</script>

<main>
	<div id="banner">
		<img src="/images/main/banner.png" alt="banière jdrpoly" />
		<div id="banner-text">
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
			<span class="material-symbols-outlined icon">polymer</span>
			<div class="double-lines" />
			<h2>Qu'est-ce que JDR-Poly ?</h2>
			<p>
				Légalement, JDR-Poly est une commission de l'AGEPoly, l'association générale des étudiants de l'EPFL. 
				Notre but est avant tout de promouvoir le jeu de rôle et d'organiser divers événements au cours de l'année à destination de tous. Une bonne partie d'entre eux se déroulent le mercredi soir dans le bâtiment <a href="#accès">INM</a>. 
				Le plus emblématique se déroule toutes les deux semaines, il s'agit des bonnes vieilles nocturnes d'initiation. 
				Il existe de nombreuses autres activités proposées, allant de la simple mais ludique soirée Loup-garou ambiancée aux fameuses murders party.
				
				Que vous soyez débutant intrigué par cet étrange loisir ou vétéran voulant se détendre de temps 	en temps, nous serons ravis de vous accueillir !
			</p>
		</header>
		<div id="events">
			<div id="title">Événements</div>
			{#each data.events as event}
				<div class="event">
					<div class="img"> 
						<img src={`/data/images/events/${event.id}.png`} alt="Evénement"/>
					</div>
					<h3>{event.title}</h3>
					<h5>{new Intl.DateTimeFormat('fr-Fr', {
						dateStyle: 'medium',
						timeStyle: 'short',
						timeZone: 'Europe/Paris'
					}).format(new Date(event.date))}</h5>
					<p>{event.description}</p>
					<a class="button" href={`/events/${event.id}`}>Découvrir</a>
				</div>
			{/each}
		</div>
	</div>

</main>

<style lang="scss">
	#banner {
		position: relative;
		overflow: hidden;

		img {
			width: 100%;
		}

		#banner-text {
			animation: fadeIn 2s;
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
		background-image: url('images/main/dark-tl.svg'), url('images/main/dark-tr.svg'),
			url('images/main/dark-bl.svg'), url('images/main/dark-br.svg');
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

		.icon {
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
			line-height: 25px;
			letter-spacing: 0.025em;
			margin: 0 10%;
		}
	}

	#events {
		font-family: 'Ubuntu';
		display: flex;
		justify-content: space-evenly;
		margin: 8em 0 0 0;
		padding: 8em 7%;
		background: rgb(0,2,26);
		background: linear-gradient(135deg, rgba(0,2,26,1) 0%, rgba(0,12,56,1) 34%, rgba(2,28,85,1) 57%, rgba(7,48,118,1) 85%, rgba(21,137,209,1) 100%);
		/**
		background: rgb(2,29,86);
		background: linear-gradient(135deg, rgba(2,29,86,1) 0%, rgba(7,48,118,1) 9%, rgba(22,71,138,1) 59%, rgba(98,182,235,1) 90%);
		*/
		
		position: relative;


		#title {
			position: absolute;
			left: 50%;
			text-align: center;
			text-transform: uppercase;
			font-weight: 700;
			letter-spacing: 0.25em;
			font-size: 1.3em;
			width: 25em;
			height: 3.25em;
			top: -3.25em;
			line-height: 3.25em;
			padding-top: 0.7em;
			color: $secondary;
			background-color: #000c37;
			transform: translateX(-50%);

		}

		.event {
			width: 22em;
			background-color: $secondary;
			padding: 2em 2em 7em 2em;
			color: black;
			box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			color: #353535;
			position: relative;
			border-radius: 8px;

			.img {
				width: 100%;
				height: 28vh;
				overflow: hidden;
				border-radius: 8px;
				position: relative;
			}
			img {
				max-height: 28vh;
				border-radius: 8px;
				margin: auto;
				display: block;
				position: absolute;
				top: -9999px;
				bottom: -9999px;
				left: -9999px;
				right: -9999px;
			}

			h3 {
				margin: 15px 5px;
				letter-spacing: 0.025em;
			} 

			h5 {
				margin: 0 0 0 5px;
			}

			p {
				padding: 20px 0 0 10px;
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
				background: rgb(2,29,86);
				background: linear-gradient(94deg, rgba(2,29,86,1) 0%, rgba(7,48,118,1) 5%, rgba(98,182,235,1) 98%);
			}
		}
		
	}

	//Media screen size

	@media screen and (max-width: 1500px) {
		#events {
			padding: 8em 2%;
		}
	}

	@media screen and (max-width: 1400) {
		#events .event {
			padding: 2em 1em 7em 1em;
		}
	}

	@media screen and (max-width: 1100px) {
		#banner #banner-text *:not(:first-child) {
			display: none;
		}

		#events {
			flex-direction: column;
			align-items: center;

			.event {
				margin: 2em 0;
				padding: 6em 4em 12em 4em;
				width: 50%;

				img {
					display: block;
					margin: 20px auto;
					margin: 0 auto 40px auto;
				}
			}
		}	
		
	}

	@media screen and (max-width: 600px) {
		header p {
			margin: 0;
		}

		#events {
			.event {
				width: 80%;
				padding: 1em 2em 7em em;
			}
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
