<script lang="ts">
	export let id: number;
	
	let src = "/avatars/" + id + ".png"
</script>

<img id="avatar" src={src} alt="avatar" on:error={(error) => {	
	src = '/avatars/default.jpg'
}} />

<style>
	img {
		max-width: 200px;
		max-height: 200px;
	}
</style>