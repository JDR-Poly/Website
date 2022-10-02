<script lang="ts">
	import { error } from '$lib/stores';
	let periodsNumber = 1;
	let mailText = '';

	let errorMails: string[] = [];

	/** @type {import('./$types').ActionData} */
	export let form;

	async function sendMailsMember() {
		let emails = mailText.split(',');
		emails.flatMap((str) => str.split(';'));

		const res = await fetch('/api/admin/roles/mail-period', {
			method: 'POST',
			body: JSON.stringify({ emails, periods: periodsNumber }),
			headers: { 'Content-Type': 'application/json' }
		});
		const body = await res.json();
		if (res.ok) {
			errorMails = body.errorMails;
			mailText = '';
		} else {
			$error = body.message;
		}
	}
</script>

<form method="POST">
	<input name="emails" type="text" placeholder="emails" bind:value={mailText} />
	<p>Combien de semestres?</p>
	<input id="radio-1" name="periodsNumber" type="radio" bind:group={periodsNumber} value="1">
	<label for="radio-1">1</label><br>
	<input id="radio-2" name="periodsNumber" type="radio" bind:group={periodsNumber} value="2">
	<label for="radio-2">2</label><br>


	<button>Ajouter</button>


</form>
