<script lang="ts">
	export let id: number;
	
	const tryImageUrl = fetch("/avatars/" + id + ".png")
		.then((res) => {
			if(res.ok) return "/avatars/" + id + ".png"
			else return '/avatars/default.jpg'
		})
		.catch((err) => {
			return '/avatars/default.jpg'
		})
</script>

{#await tryImageUrl}
{:then src} 
<img id="avatar" src={src} alt="avatar"/>
{/await}


<style>
	img {
		max-width: 200px;
		max-height: 200px;
	}
</style>