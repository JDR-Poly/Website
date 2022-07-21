<script context="module"  lang="ts">
    import { redirectIfNotAuthenticated } from "$lib/frontend/redirect";
    import type { Load } from "@sveltejs/kit";

    export const load: Load = async (event) => {
        return redirectIfNotAuthenticated(event, "/")
    }

</script>
<script lang="ts">
    import { page } from "$app/stores";
    import type { Role } from "$lib/userPermissions";
    import type { User } from "src/types";
    
    const {id} = $page.params
    let error: string | undefined

    let user: User
    let roles: Role[]

    let roleName = ""
    const dataPromise = async () => {
        
        user = await fetch("/api/u/user", {
                method: "POST",
                body: JSON.stringify({id}),
                headers: {"Content-Type" : "application/json"}
            }).then(res => res.json())
            .then(json => {
                roleName = json.user.role.name
                return json.user
            })
        
        roles = await fetch("/api/admin/roles/modifiableRoles", {
                method: "POST",
                body: JSON.stringify({id}),
                headers: {"Content-Type" : "application/json"}
            }).then(res => {
                if(res.ok) {
                    return (res.json()).then(json => json.roles)
                } else {
                    return []
                }
            })  
        return true
    }


</script>    
    {#await dataPromise()}
        <h2>Chargement de la page</h2>
    {:then foo}
        <p style="text-size: 16px;">Modifier les données de <strong>{user.name}</strong></p>
        
        <!-- Role change -->
        <form on:submit|preventDefault={async () => {
                const res = await fetch("/api/admin/roles/changeRole",{
                    method: "POST",
                    body: JSON.stringify({user, role: roleName}),
                    headers: {"Content-Type" : "application/json"}
                })
                if(res.ok) {
                    location.reload()
                } else {
                    error = "Vous n'êtes pas autorisé à changé ce rôle"
                }
            }}>
            <select bind:value={roleName} disabled={roles.length === 0}>
                {#if roles.length === 0}
                    <option value={roleName}>{roleName}</option>
                {:else}
                    {#each roles as roleOption}
                        <option value={roleOption.name}>{roleOption.name}</option>
                    {/each}
                {/if}
            </select>
            <button>Changer</button>
        </form>
        
       
    {/await}

    <style>
        form {
            background-color: lightgray;
            margin: 10px;
        }
    </style>