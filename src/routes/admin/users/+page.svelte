<script lang="ts">
	import type { User } from '$gtypes';
	import {error} from "$lib/stores"
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
  	import LinearProgress from '@smui/linear-progress';

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
			let userListURL = new URL($page.url.origin + '/api/users/search');
			userListURL.searchParams.append('number', number as any);
			userListURL.searchParams.append('index', index as any);
			userListURL.searchParams.append('searchText', searchText);

			return fetch(userListURL)
				.then(async (res) => {
					const body = await res.json()
					if (res.ok && body.length > 0) {
						return body;
					} else if (!res.ok) {
						$error = body.message
						return undefined
					}
				})			
		} catch (err) {
			console.log(err);
			$error = "An error occured"
			return undefined;
		}
	}

	let canSeeEmail = $page.data.authenticated && hasRolePermission(UserPermission.SEE_MAIL, $page.data.user.role)
	let loaded = false
</script>

<svelte:head>
	<title>Utilisateurs | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Utilisateurs</h2>

	<form
		on:submit|preventDefault={async () => {
			index = 0;
			loaded = false
			users = await search(20, index);
			loaded = true
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
					<a href="/users/profile/{result.id}"
						><div class={i == selectedIndex ? 'searchBar-active' : ''}>
							<strong>{result.name}</strong>
						</div></a
					>
				{/each}
			</div>
		</div>
		<button>Chercher</button>
	</form>

	<div id="datatable">
		{#if users}
			<DataTable table$aria-label="User list" style="width: 100%;">
				<Head>
					<Row>
						<Cell numeric>ID</Cell>
						<Cell style="width: 100%;">Nom</Cell>
						{#if canSeeEmail}
							<Cell>Email</Cell>
						{/if}
					</Row>
				</Head>
				<Body>
					{#each users as user (user.id)}
						<Row>
							<Cell numeric>{user.id}</Cell>
							<Cell><a href="/users/profile/{user.id}">{user.name}</a></Cell>
							{#if canSeeEmail}
									<Cell>{user.email}</Cell>
							{/if}
						</Row>
					{/each}
				</Body>
			
				<LinearProgress
					indeterminate
					bind:closed={loaded}
					aria-label="Data is being loaded..."
					slot="progress"
				/>
			</DataTable>
		{/if}
	</div>
</main>




<style lang="scss">
	* {
		box-sizing: border-box;
	}

	main {
		margin: 4em auto;
		width: fit-content;
		min-height: 70vh;

		h2 {
			font-family: 'Ubuntu';
			margin-bottom: 0.5em;
			width: fit-content;
		}

		.searchBar {
			position: relative;
			display: inline-block;
			width: 40vw;
		}

		button {
			padding: 6px;
			border-radius: 2px;
			cursor: pointer;
		}

		#datatable {
			margin: 1em;
		}
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
