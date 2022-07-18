<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { redirectIfAuthenticated } from '$lib/frontend/redirect';

    export const load: Load = async (event) => {
        return redirectIfAuthenticated(event, "/u/profile/" + event.session.user?.id)
    }
</script>


<script lang="ts">

    let email = ""
    let name = ""
    let password = ""

    let error: string | undefined

    async function register() {
        error = undefined
        try {
            const res = await fetch("auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    name,
                    password
                }),
                headers: {
                    "Content-Type" : "application/json"
                }
            })
            if(res.ok) {
                const body = await res.json()
                location.reload()
            } else {
                error = "An error occured"
            }
        } catch (err) {
            console.log(err)
            error = "An error occured"
        }

    }
</script>


<div>
    <h1>S'inscrire</h1>

    <input type="email" bind:value={email} placeholder="Mail">
    <input type="text" bind:value={name} placeholder="Nom Prénom">
    <input type="password" bind:value={password} placeholder="Mot de passe">

    {#if error}
        <h3>{error}</h3>
    {/if}
    <button on:click={register}>S'inscrire</button>


</div>


<style>
    div {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }
    input {
        height: 2rem;
        width: 30%;
        margin: 12px;
    }
</style>