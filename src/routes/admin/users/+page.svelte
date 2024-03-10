<!-- @format -->
<script lang="ts">
	import type { User } from "$gtypes";
	import { error } from "$lib/stores";
	import { page } from "$app/stores";
	import { hasRolePermission, UserPermission } from "$lib/userPermissions";
	import type { PageData } from "./$types";
	import DataTable from "./data-table.svelte";
	import { Button } from "$lib/components/ui/button";


	export let data: PageData;

	let users: User[] = data.users;

	//Search completion variables
	let usersSearchBar: User[] = [];
	let selectedIndex = -1;

	let searchText = "";
	let index = 0;

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
		if (event.key === "ArrowDown") {
			selectedIndex = Math.min(selectedIndex + 1, usersSearchBar.length - 1);
		} else if (event.key === "ArrowUp") {
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
			let userListURL = new URL($page.url.origin + "/api/users/search");
			userListURL.searchParams.append("number", number as any);
			userListURL.searchParams.append("index", index as any);
			userListURL.searchParams.append("searchText", searchText);

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
			$error = "An error occured";
			loaded = true;
			return [];
		}
	}

	let canSeeEmail =
		$page.data.authenticated && hasRolePermission(UserPermission.SEE_MAIL, $page.data.user.role);
	let loaded = true;

</script>

<svelte:head>
	<title>Utilisateurs | JDRPoly</title>
</svelte:head>

<main>
	<div class="container mx-auto w-dvw py-10">
	
	<h2>Utilisateurs</h2>

	<form
		on:submit|preventDefault={async () => {
			index = 0;
			loaded = false;
			users = await search(100, index);
			loaded = true;
		}}
		autocomplete="off"
		class="my-4"
	>
		 <div
			class="searchBar mr-4"
			on:focusout={(event) => {
				setTimeout(() => {
					selectedIndex = -1;
					usersSearchBar = [];
				}, 500);
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
						><div class={i == selectedIndex ? "searchBar-active" : ""}>
							<strong>{result.name}</strong>
						</div></a
					>
				{/each}
			</div>
		</div>
		<Button type="submit" variant={"outline"}>Chercher</Button>
	</form>

		<DataTable {users} pageSize={data.pageSize}/>
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
	}

	input {
		border: 1px solid transparent;
		background-color: #f1f1f1;
		padding: 10px;
		font-size: 16px;
	}

	input[type="text"] {
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
