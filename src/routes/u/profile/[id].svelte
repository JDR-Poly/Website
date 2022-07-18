<script context="module"  lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { writable } from 'svelte/store';
    import { getUserSessionData } from '$lib/frontend/userSession';

    const authenticated = writable(false);
    const role = writable<Role>();

    export const load: Load = async (event) => {
        getUserSessionData(event, {authenticated, role})
        return { status: 200 }
    }
</script>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { Role, Roles, UserPermission } from "$lib/userPermissions";
    import type { User } from "src/types";

const {id} = $page.params
let userRole: Role

const userPromise: Promise<User> = fetch("/api/u/user", {
        method: "POST",
        body: JSON.stringify({id}),
        headers: {"Content-Type" : "application/json"}
    }).then(res => res.json())
    .then(json => {
        userRole = Roles[json.user.role]
        return json.user
    })
</script>


<h2>{id}</h2>

<button on:click={() => {goto("/")}}>Accueil</button>

{#await userPromise}
    <h2>Loading user</h2>
{:then user}
    <p>Email: {user.email}</p>
    <p>Nom: {user.name}</p>
    <p>Role: {user.role} </p>
    <p>Date de création: {user.accountCreation} </p>

    {#if ($role && $role.permissions.has(UserPermission.MODIFY_USERS_DATA))}
        <a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
    {/if}
{:catch err} 
    <h1>{err}</h1>
{/await}