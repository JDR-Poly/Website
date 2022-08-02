<script context="module" lang="ts">
    import { redirectIfAuthenticated } from '$lib/frontend/redirect';
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async (event) => {
        return redirectIfAuthenticated(event, "/u/profile/" + event.session.user?.id)
    }
</script>


<script lang="ts">
	import {error} from  "$lib/stores"
    let email = "";
    let password = "";

    async function login() {
        try {

            const res = await fetch("/auth/login", {
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
                $error = body.message
            }
        } catch (err) {
            console.log(err)
            $error = "An error occured"
        }
    }
</script>

<div>
    <h1>Se connecter</h1>

    <input type="email" bind:value={email} placeholder="Mail">
    <input type="password" bind:value={password} placeholder="Mot de passe">

    <button on:click={login}>Se connecter</button>

</div>

<a href="/u/register">Vous ne possédez pas de compte ?</a>

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