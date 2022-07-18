<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { Role, Roles, UserPermission } from "$lib/userPermissions";
    import type { User } from "src/types";
    import {user} from "../../stores"

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

{#await userPromise}
    <h2>Loading user</h2>
{:then profileUser}

    <h1>Profile</h1>
    <p>Email: {profileUser.email}</p>
    <p>Nom: {profileUser.name}</p>
    <p>Role: {profileUser.role?.name} </p>
    <p>Date de création: {profileUser.accountCreation} </p>

    {#if ($user.role?.permissions.has(UserPermission.MODIFY_USERS_DATA))}
        <a href="/admin/profile/{id}">Modifier les données de cet utilisateur</a>
    {/if}
{:catch err} 
    <h1>{err}</h1>
{/await}