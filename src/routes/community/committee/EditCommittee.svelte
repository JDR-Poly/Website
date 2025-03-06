<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button";
    import type { Committee } from "$gtypes"; // Ensure you have this type

    export let openEditDialog: Writable<boolean>;
    export let committeeToEdit: Writable<Committee | null>;

    let formData = writable({
        name: "",
        title: "",
        description: ""
    });

    // Met à jour les données quand on ouvre le modal
    $: if ($committeeToEdit) {
        formData.set({
            name: $committeeToEdit.name || "",
            title: $committeeToEdit.title || "",
            description: $committeeToEdit.description || ""
        });
    }

    async function submitEdit() {
    console.log("Modifying committee:", $committeeToEdit);

    if (!$committeeToEdit) {
        console.error("No committee selected for editing.");
        return;
    }

    const response = await fetch("/api/committee", {  
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: $committeeToEdit.id,  
            name: $formData.name,
            title: $formData.title,
            description: $formData.description,
            category: $committeeToEdit.category
        })
    });

    if (response.ok) {
        openEditDialog.set(false);
        location.reload();
    } else {
        console.error("Error updating committee.");
    }
}

</script>

<Dialog.Root open={$openEditDialog}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Modifier un comité</Dialog.Title>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <Input bind:value={$formData.name} placeholder="Nom" />
            <Input bind:value={$formData.title} placeholder="Titre" />
            <Input bind:value={$formData.description} placeholder="Description" />
        </div>

        <Dialog.Footer>
            <Button on:click={() => openEditDialog.set(false)}>Annuler</Button>
            <Button on:click={submitEdit}>Modifier</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
