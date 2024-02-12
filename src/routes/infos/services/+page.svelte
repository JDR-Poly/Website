<!-- @format -->
<script lang="ts">
	import { page } from "$app/stores";
</script>
<!-- @format -->
<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Services | JDRPoly</title>
	<meta name="title" content="Services | JDRPoly" />
	<meta name="description" content="Services proposées, salles à disposition." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Services | JDRPoly" />
	<meta property="og:description" content="Services proposées, salles à disposition." />
</svelte:head>

<main>
	<h2>Salles :</h2>
	<p>
		En alternance avec nos nocturnes d'initiation aux jeux de rôle, lors des soirées membres (les
		mercredis), vous pouvez réserver une salle auprès de JDR-Poly pour vos campagnes ou oneshots. Pour
		cela, il suffit d'envoyer un mail à comite@jdrpoly.ch ou contacter un comité sur telegram/discord
		quelques jours en avance. Les salles sont disponibles pour utilisation de 19h à 22h.
	</p>
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

		p {
			white-space: pre-line;
			text-align: justify;
			margin-bottom: 2em;
			color: #777;
		}
		p {
			line-height: 27px;
		}
	}
</style>
