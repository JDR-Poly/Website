<script lang="ts">
	import { onMount } from "svelte";


	export let url: string;
	export let defaultUrl: string;
	export let alt: string | undefined;

	let tryImageUrl = ""
	
	onMount(async () => {
		tryImageUrl = await fetch(url)
			.then((res) => {
				if(res.ok) return url
				else return defaultUrl
			})
			.catch((_) => {
				return defaultUrl
			})
	}) 
</script>

<img src={tryImageUrl} {alt}/>