<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";

const {id} = $page.params

</script>


<h2>{id}</h2>

<button on:click={() => {
    goto("/")
}}>Accueil</button>