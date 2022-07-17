<script context="module"  lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { writable } from 'svelte/store';
    import { getUserSessionData } from '$lib/frontend/userSession';

    const authenticated = writable(false);
    const profileId = writable(0);

    export const load: Load = async (event) => {
        getUserSessionData(event, {authenticated, profileId})
        return {status: 200}
    }
</script>
<script lang="ts">
    async function logout() {
        const res = await fetch("auth/logout", {method: "POST"})
        authenticated.set(false)
        profileId.set(0)
        location.reload()
    }
</script>

<h1>Accueil</h1>

{#if $authenticated}
    <a href="/u/profile/{$profileId}">Profile</a>
    <button on:click={logout}>Se déconnecter</button>
{:else}
    <a href="/login">Se connecter</a>
    <a href="/register">S'inscrire</a>
{/if}
