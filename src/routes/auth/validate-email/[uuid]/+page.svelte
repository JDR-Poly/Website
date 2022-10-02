<script lang="ts">
	import { page } from '$app/stores';
	import { info, error } from '$lib/stores';
	import { goto, invalidateAll } from '$app/navigation';

	const { uuid } = $page.params;

	const emailValidationResult = fetch('/api/auth/email/validate', {
		method: 'POST',
		body: JSON.stringify({ uuid }),
		headers: { 'Content-Type': 'application/json' }
	}).then((res) => {
		
		if (res.ok) {
			setTimeout(() => invalidateAll(), 2000);
		}
		return res;
	});
</script>

{#await emailValidationResult}
	<h1>Loading</h1>
{:then res}
	{#if res.ok}
		<p>Votre mail est validé ! Nous allons vous rediriger vers la page d'accueil</p>
	{:else}
		<p>Ce lien n'est plus valide</p>
		<button
			on:click={async () => {
				try {
					const res = await fetch('/api/auth/email/send', {
						method: 'POST',
						body: JSON.stringify({
							id: $page.data.user.id
						}),
						headers: { 'Content-Type': 'application/json' }
					});
					if (res.ok) {
						$info = "Le mail vient d'être envoyé";
						setTimeout(() => goto('/auth/validate-email'), 3000);
					}
				} catch (err) {
					$error = 'An error occured';
					console.error(err);
				}
			}}>Envoyer un nouveau mail</button
		>
	{/if}
{/await}
