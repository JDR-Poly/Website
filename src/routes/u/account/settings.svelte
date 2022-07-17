<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { redirectIfNotAuthenticated } from '$lib/frontend/redirect';

    export const load: Load = async (event) => {
        return redirectIfNotAuthenticated(event, "/login")
    }
</script>

<h2>Account setting</h2>