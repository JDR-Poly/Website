<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import { warning, info, error } from '$lib/stores';
	import { page } from '$app/stores';
</script>

<h2>Account setting</h2>

<Avatar id={$page.data.user?.id}></Avatar>