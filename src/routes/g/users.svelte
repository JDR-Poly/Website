<script lang="ts">
	import type { User } from 'src/types';
	import {error} from "$lib/stores"
	//Search completion variables
	let searchCompletion: User[] = [];
	let selectedIndex = -1;

	//Search result variable
	let searchText = '';
	let index = 0;
	let users: Array<User> | undefined;

	/**
	 * Handle when the user write text in the searchBar
	 * to add possible result as completion
	 */
	async function inputChange() {
		if (searchText.length < 3) {
			searchCompletion = [];
			return;
		}
		searchCompletion = (await search(4, 0)) || [];
	}

	/**
	 * Detect the arrow keys when the user is focused
	 * on the input
	 * @param event KeyboardEvent from svelte
	 */
	function onKeypressInput(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			selectedIndex = Math.min(selectedIndex + 1, searchCompletion.length - 1);
		} else if (event.key === 'ArrowUp') {
			selectedIndex = Math.max(0, selectedIndex - 1);
		}
	}

	/**
	 * Fetch a certain numbers of users
	 * (with a possible offset)
	 * @param number how many users to search for
	 * @param index offset of the index
	 */
	async function search(number: number, index: number): Promise<User[] | undefined> {
		try {
			const res = await fetch('/api/g/users', {
				method: 'POST',
				body: JSON.stringify({
					number: number,
					index: index,
					searchText: searchText
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const body = await res.json();
			if (res.ok && body.users.length > 0) {
				return body.users;
			} else if (!res.ok) {
				$error = body.message
			}
		} catch (err) {
			console.log(err);
			$error = "An error occured"
		}
		return undefined;
	}
</script>

<h2>Users</h2>

<form
	on:submit|preventDefault={async () => {
		index = 0;
		users = await search(20, index);
	}}
	autocomplete="off">
	<div
		class="searchBar"
		on:focusout={(event) => {
			setTimeout(() => {
				selectedIndex = -1;
				searchCompletion = [];
			}, 100);
		}}
	>
		<input
			type="text"
			placeholder="Chercher un utilisateur"
			bind:value={searchText}
			on:input={inputChange}
			on:keydown={onKeypressInput}
		/>
		<div class="searchBar-items">
			{#each searchCompletion as result, i}
				<a href="/u/profile/{result.id}"
					><div class={i == selectedIndex ? 'searchBar-active' : ''}>
						<strong>{result.name}</strong>
					</div></a
				>
			{/each}
		</div>
	</div>
	<button>Chercher</button>
</form>

{#if users}
	{#each users as user}
		<div class="user">
			<p><a href="/u/profile/{user.id}"><strong>{user.name}</strong></a> {user.email}</p>
		</div>
	{/each}
{/if}

<style>
	* {
		box-sizing: border-box;
	}

	div.user {
		margin: 10px;
		background-color: lightgray;
	}

	.searchBar {
		position: relative;
		display: inline-block;
		width: 500px;
	}

	input {
		border: 1px solid transparent;
		background-color: #f1f1f1;
		padding: 10px;
		font-size: 16px;
	}

	input[type='text'] {
		background-color: #f1f1f1;
		width: 100%;
	}

	.searchBar-items {
		position: absolute;
		border: 1px solid #d4d4d4;
		border-bottom: none;
		border-top: none;
		z-index: 99;
		/*position the autocomplete items to be the same width as the container:*/
		top: 100%;
		left: 0;
		right: 0;
	}
	.searchBar-items div {
		padding: 10px;
		cursor: pointer;
		background-color: #fff;
		border-bottom: 1px solid #d4d4d4;
	}
	.searchBar-items div:hover {
		/*when hovering an item:*/
		background-color: #e9e9e9;
	}
	.searchBar-active {
		/*when navigating through the items using the arrow keys:*/
		background-color: DodgerBlue !important;
		color: #ffffff;
	}
</style>
