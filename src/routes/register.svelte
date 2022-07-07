<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async (event) => {
        if(event.session.authenticated) {
            return {
                status: 302,
                redirect: "/"
            }
        } else {
            return {
                status: 200
            }
        }

    }
</script>

<script lang="ts">
    import { goto } from '$app/navigation';

    let email = ""
    let name = ""
    let surname = ""
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
                    surname,
                    password
                }),
                headers: {
                    "Content-Type" : "application/json"
                }
            })
            if(res.ok) {
                const body = await res.json()
                await goto("/u/profile/" + body.profileId);
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
    <input type="text" bind:value={name} placeholder="Nom">
    <input type="text" bind:value={surname} placeholder="Prénom">
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