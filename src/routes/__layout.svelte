<script context="module"  lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { getUserSessionData } from '$lib/frontend/userSession';
    import {authenticated, user} from "./stores"
    import { UserPermission } from '$lib/userPermissions';

    

    export const load: Load = async (event) => {
        getUserSessionData(event, {authenticated, user})
        return {status: 200}
    }
</script>
<script lang="ts">
    import {session} from "$app/stores"
    async function logout() {
        const res = await fetch("/auth/logout", {method: "POST"})
        $session = {authenticated: false, user: undefined}
        $authenticated = false
        $user = {id: 0}
    }
</script>

<nav>
    <a href="/">Accueil</a>
    <ul>
        <p>Communauté</p>
        <ul>
            <li><a href="/g/users">Utilisateurs</a></li>
            <li>Photos</li>
        </ul>

        <p>Informations</p>
        <ul>
            <li>Commission</li>
            <li>Documents officiel</li>
        </ul>


        {#if $authenticated && $user.role?.permissions.has(UserPermission.ADMIN_PANEL)}
            <p>Panel admin</p>
        {/if}
        <br>
        {#if $authenticated && $user.isEmailValidated} 
            <p>{$user.name}</p>
            <ul>
                <li><a href="/u/profile/{$user.id}">Profile</a></li>
                <li><button on:click={logout}>Se déconnecter</button></li>
            </ul>
        {:else}
            <a href="/u/login">Se connecter</a>
        {/if}
    </ul>

</nav>


<slot></slot>