<!-- @format -->
<script lang="ts">
	import Icon from "@iconify/svelte";

	export let icon: string;
	export let action: (e: MouseEvent) => void;
	export let text = "";
	export let inline = false;
	export let disabled = false;
	export let label: string;
</script>

<button on:click={action} {disabled} aria-label={label}>
	{text}
	<Icon {icon} {inline} />
</button>

<style lang="scss">
	button {
		border: none;
		background: none;

		:global(svg) {
			color: white;
		}
	}
</style>
