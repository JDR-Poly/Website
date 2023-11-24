<!-- @format -->
<script lang="ts">
	export let imageb64: string | undefined;
	export let alternativeImageSrc: string;
	export let alt: string;
</script>

{#if imageb64}
	<img src={`data:image/png;base64,${imageb64}`} {alt} />
{:else}
	<img src={alternativeImageSrc} {alt} />
{/if}
