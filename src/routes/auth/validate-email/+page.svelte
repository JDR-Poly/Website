<script lang="ts">
	import { info } from '$lib/stores';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
</script>

<h>En attente de validation du mail</h>

<p>Vous avez dû recevoir un mail de validation à l'email: {$page.data.user.email}</p>

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
			}
		} catch (err) {
			console.error(err);
		}
	}}>Renvoyez un mail</button
>

<button
	on:click={async () => {
		const res = await fetch('/api/auth/logout', { method: 'POST' });
		await invalidateAll()
	}}>Mauvais email ?</button
>
