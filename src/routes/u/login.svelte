<script context="module" lang="ts">
    import { redirectIfAuthenticated } from '$lib/frontend/redirect';
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async (event) => {
        return redirectIfAuthenticated(event, "/u/profile/" + event.session.profileId)
    }
</script>


<script lang="ts">
    let email = "";
    let password = "";
    let error: string|undefined;

    async function login() {
        error = undefined
        try {

            const res = await fetch("auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                }),
                headers: {
                    "Content-Type" : "application/json"
                }
            })
            const body = await res.json()
            if(res.ok) {
                location.reload()
            } else {
                error = body.message
            }
        } catch (err) {
            console.log(err)
            error = "An error occured"
        }
    }
</script>

<div>
    <h1>Se connecter</h1>

    <input type="email" bind:value={email} placeholder="Mail">
    <input type="password" bind:value={password} placeholder="Mot de passe">

    {#if error}
        <h3>{error}</h3>
    {/if}

    <button on:click={login}>Se connecter</button>

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