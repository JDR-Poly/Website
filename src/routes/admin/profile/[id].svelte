<script context="module"  lang="ts">
    import { redirectIfNotAuthenticated } from "$lib/frontend/redirect";
    import type { Load } from "@sveltejs/kit";

    export const load: Load = async (event) => {
        return redirectIfNotAuthenticated(event, "/")
    }

</script>
<script lang="ts">
    import { page } from "$app/stores";
    import ModifyRole from "$lib/components/admin/user/ModifyRole.svelte";
    
    const {id} = $page.params

    const userQuery = fetch("/api/u/user", {
                method: "POST",
                body: JSON.stringify({id}),
                headers: {"Content-Type" : "application/json"}
            })
            .then(res => res.json())
            .then(json => json.user)


</script>    
    {#await userQuery}
        <h2>Chargement de la page</h2>
    {:then user}
        <p style="text-size: 16px;">Modifier les données de <strong>{user.name}</strong></p>
        
        <ModifyRole user={user}/>
    {/await}
