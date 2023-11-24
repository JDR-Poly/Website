<!-- @format -->
<script lang="ts">
	import AlertDisplay from "$lib/components/AlertDisplay.svelte";
	import Navbar from "./_layout/Navbar.svelte";
	import Footer from "./_layout/Footer.svelte";
</script>

<nav>
	<Navbar />
</nav>

<slot />

<Footer />

<AlertDisplay />

<style lang="scss" global>
	@import "static/sass/layout";
</style>
