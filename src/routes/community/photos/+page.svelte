<!-- @format -->
<script lang="ts">
	import { page } from "$app/stores";
</script>
<!-- @format -->
<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Photos | JDRPoly</title>
	<meta name="title" content="Photos | JDRPoly" />
	<meta name="description" content="Accès photos des événements de JDR-Poly." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Photos | JDRPoly" />
	<meta property="og:description" content="Accès photos des événements de JDR-Poly." />
</svelte:head>

<main>
	<h2>Galeries photo :</h2>

	<p>
		Retrouvez maintenant toutes les photos des nocturnes en cliquant <a
			href="https://drive.google.com/drive/folders/0Bwpjt6y4k-PrRjlHb3ZvQVF3RlU?resourcekey=0-4uz7-_stz04NvEDY0tmySA&usp=sharing"
			>ici</a
		> !
	</p>
</main>
<style lang="scss">
	main {
		margin: 4em;

		h2 {
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 5px;
		}
	}
</style>
