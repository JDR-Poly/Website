<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { error, warning, info } from '$lib/stores';
	import IconButton from './IconButton.svelte';

	let idCounter = 0

	function closeButton(event: MouseEvent) {		
		removeAlertById(parseInt((event.target as any).parentElement.parentElement.id))
	}


	function removeAlertById(id: number) {
		for(let i=0;i<alertArray.length;i++) {
			if(alertArray[i].id === id) {
				alertArray.splice(i, 1)
				break
			}
		}
		alertArray = alertArray
	}

	type Alert = {
		id: number,
		type: string,
		text: string
	}

	let alertArray: Alert[] = []

	function createAlert(text: string, type: string) {
		let alert: Alert = {
			id: idCounter++,
			text: text,
			type: type
		}
		alertArray = [...alertArray, alert]
		setTimeout(() => {
			removeAlertById(alert.id)
		}, 6000)
	}

	error.subscribe(text => {
		if(!text) return
		createAlert(text, "error")
		$error = undefined
	})

	warning.subscribe(text => {
		if(!text) return
		createAlert(text, "warning")
		$warning = undefined
	})

	info.subscribe(text => {
		if(!text) return
		createAlert(text, "info")
		$info = undefined
	})
</script>
	<div class="container">
		{#each alertArray as alert}
			<div class="alert {alert.type}" id="{alert.id.toString()}" in:fly={{x: 200, duration: 2000}}>
				{alert.text}
				<IconButton icon="material-symbols:close" action={closeButton} label="Fermer l'alert"/>
			</div>
		{/each}
	</div>

<style>
	.container {
		position: fixed;
		right: 0px;
		bottom: 0px;
		width: 25%;
		z-index: 3;
	}
	.alert {
		padding: 20px;
		color: white;
		margin-bottom: 15px;
		opacity: 0.8;
		width: 100%;
		position: relative;
		right: 35px;
	}
	/* The close button */
	.container :global(button) {
		margin-right: 10px;
		color: white;
		font-weight: bold;
		float: right;
		font-size: 22px;
		line-height: 20px;
		cursor: pointer;
		transition: 0.3s;
	}

	.error {
		background-color: #f44336; 
		border-left: 6px solid #ce261a;
	}

	.warning {
		background-color: #ff9800;
		border-left: 6px solid #d4840b;

	}

	.info {
		background-color: #04AA6D;
		border-left: 6px solid #0f8b5e;
	}
</style>
