<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import { warning, info, error } from '$lib/stores';
	import { page } from '$app/stores';
	
	let memberCode = '';

	async function validateMembershipCode() {
		const res = await fetch('/api/u/membership/validate', {
			method: 'POST',
			body: JSON.stringify({ validation_token: memberCode }),
			headers: { 'Content-Type': 'application/json' }
		});
		const body = await res.json();
		if (res.ok) {
			$info = 'Vous avez reçu ' + body.periodsNumber + ' semestre(s) de membre.';
		} else {
			$warning = "Ce code n'est pas valide";
		}
	}

	let images: undefined | FileList = undefined
	function getBase64(image: File): Promise<string | ArrayBuffer | null | undefined> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(image);
			reader.onload = (e) => {
				resolve(e?.target?.result)
			};
			reader.onerror = reject;
		});
    };

	async function uploadAvatar(imgBase64: any) {
        const imgData = imgBase64.split(',');
		const data = {image: imgData[1]}
        fetch('/api/images/avatars', {
			method: "POST",
			body: JSON.stringify(data)
		}).then(() => {
			location.reload()
		}).catch((err) => {
			$error = err.message
		})
	}

	let imgBase64: string | ArrayBuffer | null | undefined = undefined
</script>

<h2>Account setting</h2>

<p>Valider un semestre de membre</p>
<input type="text" placeholder="code" bind:value={memberCode} />
<button on:click={validateMembershipCode}>Valider</button>

<Avatar id={$page.data.user?.id}></Avatar>
<form>
	<input type="file" accept="image/png, image/jpeg" bind:files={images} on:change={async () => {
		if(images && images[0]) {
			if(images[0].size > 2097152) {
				$warning = "Image max 2MB"
				imgBase64 = undefined
				images = undefined
			} else {
				imgBase64 = await getBase64(images[0])		
			}
			
		} 
	}}/>
	<button disabled={Boolean(!imgBase64)} on:click|preventDefault={() => {
		uploadAvatar(imgBase64)
	}}>Upload ! </button>
</form>