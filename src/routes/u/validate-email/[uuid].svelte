<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (event) => {
		if (!event.session.authenticated) {
			return {
				status: 302,
				redirect: '/u/login'
			};
		} else if (event.session.user?.is_email_validated !== false) {
			return {
				status: 302,
				redirect: '/'
			};
		} else {
			return {
				status: 200
			};
		}
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { user, info, error } from '$lib/stores';
	import { goto } from '$app/navigation';

	const { uuid } = $page.params;

	const emailValidationResult = fetch('/auth/validate-email', {
		method: 'POST',
		body: JSON.stringify({ uuid }),
		headers: { 'Content-Type': 'application/json' }
	}).then((res) => {
		if (res.ok) {
			setTimeout(() => location.reload(), 2000);
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
					const res = await fetch('/auth/send-email-validation', {
						method: 'POST',
						body: JSON.stringify({
							id: $user.id
						}),
						headers: { 'Content-Type': 'application/json' }
					});
					if (res.ok) {
						$info = "Le mail vient d'être envoyé";
						setTimeout(() => goto('/u/validate-email'), 3000);
					}
				} catch (err) {
					$error = 'An error occured';
					console.error(err);
				}
			}}>Envoyer un nouveau mail</button
		>
	{/if}
{/await}
