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
	import { authenticated, user, info } from '$lib/stores';
</script>

<h>En attente de validation du mail</h>

<p>Vous avez dû recevoir un mail de validation à l'email: {$user.email}</p>

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
			}
		} catch (err) {
			console.error(err);
		}
	}}>Renvoyez un mail</button
>

<button
	on:click={async () => {
		const res = await fetch('/auth/logout', { method: 'POST' });
		authenticated.set(false);
		user.set({ id: 0 });
		location.reload();
	}}>Mauvais email ?</button
>
