<script lang="ts">
    import Icon from '@iconify/svelte';

    export let icon: string
    export let color: string = "white"
    export let fontSize: number = 20 
    export let action: (e: MouseEvent) => void
    export let text: string = ""
    export let inline: boolean = false
    export let disabled: boolean = false
</script>
<button on:click={action} style="--icon-color: {color}; --font-size: {fontSize};" disabled={disabled}>
    {text}
    <Icon icon={icon} {inline}/>
</button>

<style lang="scss">
    button {
        border: none;
        background: none;
        
        :global(svg) {
            font-size: var(--font-size);
            color: var(--icon-color);
        }
    }
</style>