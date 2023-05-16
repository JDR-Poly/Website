<script lang="ts">
	import type { User } from '$gtypes';
	import { error } from '$lib/stores';
	import { page } from '$app/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import DataTable, { Head, Body, Row, Cell, SortValue, Label } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
	import type { PageData } from './$types';
	import IconButton from '@smui/icon-button';

	export let data: PageData;

	//Search completion variables
	let usersSearchBar: User[] = [];
	let selectedIndex = -1;

	let searchText = '';
	let index = 0;

	//List of users
	let users: User[] = data.users;

	/**
	 * Handle when the user write text in the searchBar
	 * to add possible result as completion
	 */
	async function inputChange() {
		if (searchText.length < 3) {
			usersSearchBar = [];
			return;
		}
		usersSearchBar = (await search(5, 0)) || [];
	}

	/**
	 * Detect the arrow keys when the user is focused
	 * on the input
	 * @param event KeyboardEvent from svelte
	 */
	function onKeypressInput(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			selectedIndex = Math.min(selectedIndex + 1, usersSearchBar.length - 1);
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
	async function search(number: number, index: number): Promise<User[]> {
		try {
			loaded = false;
			let userListURL = new URL($page.url.origin + '/api/users/search');
			userListURL.searchParams.append('number', number as any);
			userListURL.searchParams.append('index', index as any);
			userListURL.searchParams.append('searchText', searchText);

			return fetch(userListURL).then(async (res) => {
				const body = await res.json();
				loaded = true;
				if (res.ok && body.length > 0) {
					return body;
				} else if (!res.ok) {
					$error = body.message;
					return [];
				}
			});
		} catch (err) {
			console.error(err);
			$error = 'An error occured';
			loaded = true;
			return [];
		}
	}

	function handleSort() {
		users.sort((a, b) => {
			return sortDirection === 'ascending' ? a.id - b.id : b.id - a.id
		});
		users = users;
	}

	let canSeeEmail =
		$page.data.authenticated && hasRolePermission(UserPermission.SEE_MAIL, $page.data.user.role);
	let loaded = true;

	let sort = 'id';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
</script>

<svelte:head>
	<title>Utilisateurs | JDRPoly</title>
</svelte:head>

<main>
	<h2>Utilisateurs</h2>

	<form
		on:submit|preventDefault={async () => {
			index = 0;
			loaded = false;
			users = await search(100, index);
			loaded = true;
		}}
		autocomplete="off"
	>
		<div
			class="searchBar"
			on:focusout={(event) => {
				setTimeout(() => {
					selectedIndex = -1;
					usersSearchBar = [];
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
				{#each usersSearchBar as result, i}
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
			<DataTable
				table$aria-label="User list"
				style="width: 100%;"
				sortable
				bind:sort
				bind:sortDirection
				on:SMUIDataTable:sorted={handleSort}
			>
				<Head>
					<Row>
						<Cell numeric columnId="id">
							<IconButton class="material-icons">arrow_upward</IconButton>
							<Label>Id</Label>
						</Cell>
						<Cell style="width: 100%;" sortable={false}>Nom</Cell>
						<Cell sortable={false}>Rôle</Cell>
						{#if canSeeEmail}
							<Cell sortable={false}>Email</Cell>
						{/if}
					</Row>
				</Head>
				<Body>
					{#each users as user (user.id)}
						<Row>
							<Cell numeric>{user.id}</Cell>
							<Cell><a href="/users/profile/{user.id}">{user.name}</a></Cell>
							<Cell>{user.role}</Cell>
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
		z-index: 6;
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
