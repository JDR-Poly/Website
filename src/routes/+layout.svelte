<!-- @format -->
<script lang="ts">
	import "../app.pcss";
    import AlertDisplay from "$lib/components/AlertDisplay.svelte";
    import Navbar from "./_layout/Navbar.svelte";
    import Footer from "./_layout/Footer.svelte";
</script>

<nav>
	<Navbar></Navbar>
</nav>

<slot></slot>

<Footer></Footer>

<AlertDisplay></AlertDisplay>

<style lang="scss" global>
	@import "static/sass/layout";
</style>
