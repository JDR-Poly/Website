<!-- @format -->
<script lang="ts">
	import { page } from "$app/stores";
</script>
<!-- @format -->
<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Accès | JDR-Poly</title>
	<meta name="title" content="Accès | JDR-Poly" />
	<meta name="description" content="Instruction accèder aux salles des événéments." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Accès | JDR-Poly" />
	<meta property="og:description" content="Instruction accèder aux salles des événéments." />
</svelte:head>

<main>
	<h2>Plan d'accès :</h2>
	<p>
		La majorité de nos événements ont lieu sur le campus de l'EPFL dans les salles du bâtiment INM. Voici
		quelques instructions sur comment t'y rendre ainsi qu'une carte. La salle appropriée pour l'événement
		sera toujours indiquée sur l'affiche ou sur notre site web.
	</p>

	<ul>
		<li>Depuis le métro M1 (arrêt EPFL), sortir et descendre dans le sous-voie</li>
		<li>Aller vers le campus de l'epfl et monter les marches puis continuer le long des bâtiments</li>
		<li>
			Au bout de cette ligne droite à gauche se trouvera une place, à droite une passerelle, prendre
			cette dernière
		</li>
		<li>Suivre la passerelle, jusqu'à arriver devant le bâtiment INM.</li>
	</ul>
	<p>
		Lien de Plan EPFL de l'entrée du bâtiment: <a href="https://plan.epfl.ch//?room==INM%20194.0"
			>Plan EPFL</a
		>
	</p>

	<img src="/images/plan/plan.webp" alt="plan accès INM" width="1200" height="1700" />
</main>
<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		p,
		li {
			white-space: pre-line;
			text-align: justify;
			margin-bottom: 2em;
			color: #777;
		}
		p {
			line-height: 27px;
		}
		ul {
			margin-left: 40px;
		}

		img {
			padding: 1em;
			border: 1px solid gray;
			max-width: 60vw;
		}
	}
</style>
