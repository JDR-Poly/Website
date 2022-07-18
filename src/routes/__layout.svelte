<script context="module"  lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { getUserSessionData } from '$lib/frontend/userSession';
    import {authenticated, profileId, email, role} from "./stores"
    import { UserPermission } from '$lib/userPermissions';

    

    export const load: Load = async (event) => {
        getUserSessionData(event, {authenticated, profileId, email, role})
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

        {#if $authenticated && $role.permissions.has(UserPermission.ADMIN_PANEL)}
            <p>Panel admin</p>
        {/if}
        <br>
        {#if $authenticated} 
            <p>{$email}</p>
            <ul>
                <li><a href="/u/profile/{$profileId}">Profile</a></li>
                <li><button on:click={logout}>Se déconnecter</button></li>
            </ul>
        {:else}
            <a href="/u/login">Se connecter</a>
        {/if}
    </ul>

</nav>


<slot></slot>