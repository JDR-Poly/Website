<!-- @format -->
<script lang="ts">
    import { type Code } from "./codes";
    
    let codes: Code[] = [
        {
            email: "jean@gamil.com",
            email_sent: new Date("December 17, 1995 03:24:00")
        },
        {
            email: "marcin@gmail.com",
            email_sent: new Date("January 12, 2026 12:31:00")
        },
        {
            email: "charles@proton.me",
            email_sent: new Date("May 13, 2007 18:27:00")
        }
    ];
</script>

<svelte:head>
	<title>Codes Membres | JDR-Poly</title>
</svelte:head>

<main>
    { codes }
</main>
