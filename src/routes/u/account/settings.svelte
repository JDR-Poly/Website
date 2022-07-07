<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async (event) => {
        if(!event.session.authenticated) {
            return {
                status: 302,
                redirect: "/login"
            }
        } else {
            return {
                status: 200
            }
        }

    }
</script>

<h2>Account setting</h2>