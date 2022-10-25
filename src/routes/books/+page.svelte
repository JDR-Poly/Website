<script lang="ts">
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Fab, { Icon, Label } from '@smui/fab';
	import { error, warning } from '$lib/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import Edit from './Edit.svelte';
	const openAddDialog = writable(false);
	const openEditDialog = writable(false);

	let change = false; //Indicate if the order was changed and the new order need to be saved

	let reqBooks = fetch('/api/books')
		.then((res) => {
			return res.json();
		})
		.then((res) => {
			return sortByItemOrder(res);
		})
		.catch((err) => {
			$error = err.message;
		});

	function sortByItemOrder(books: any) {
		return books.sort((a: any, b: any) => (a.item_order >= b.item_order ? 1 : -1));
	}

	function addOneToOrder(books: any, current_book: any) {
		//Change the order of the committes
		const nextBook = books.filter((v: any) => {
			return v.item_order === current_book.item_order + 1;
		});

		if (nextBook.length < 1) return;

		nextBook.forEach((v: any) => {
			v.item_order--;
		});

		current_book.item_order++;
		change = true;
		reqBooks = (async () => {
			return sortByItemOrder(books);
		})();
	}

	function removeOneToOrder(books: any, current_book: any) {
		//Change the order of the committes
		const nextBook = books.filter((v: any) => {
			return v.item_order === current_book.item_order - 1;
		});

		if (nextBook.length < 1) return;

		nextBook.forEach((v: any) => {
			v.item_order++;
		});

		current_book.item_order--;
		change = true;
		reqBooks = (async () => {
			return sortByItemOrder(books);
		})();
	}

	async function updateOrders(books: any[]) {
		books.forEach((book) => {
			fetch('/api/books/' + book.id, {
				method: 'PATCH',
				body: JSON.stringify(book)
			})
				.then(() => {
					location.reload();
				})
				.catch((err) => {
					$error = err.message;
				});
		});
	}

	const statusList = ['Disponible', 'Indisponible'];
	let editBook: any = undefined;
</script>

{#await reqBooks}
	<!---->
{:then books}
	{#if change && hasRolePermission(UserPermission.MODIFY_BOOKS, $page.data.user?.role)}
		<div id="fab-container">
			<Fab color="secondary" on:click={() => updateOrders(books)} extended>
				<Icon class="material-icons">done</Icon>
				<Label>Sauvegarder</Label>
			</Fab>
		</div>
	{/if}
	<ul>
		{#each books as book}
			<li class="book">
				<p>
					{book.title} |
					<i>Caution: {book.caution}</i>
					<b>Disponible:</b>
					<Icon class="material-icons">{book.status == 'Disponible' ? 'done' : 'close'}</Icon>
				</p>
				{#if hasRolePermission(UserPermission.MODIFY_BOOKS, $page.data.user?.role)}
					<div class="admin-buttons">
						<Fab
							on:click={() => {
								if (change) {
									$warning = "Vous devez d'abord sauvegarder l'ordre";
									return;
								}
								editBook = book;
								$openEditDialog = true;
							}}
							mini
						>
							<Icon class="material-icons">edit</Icon>
						</Fab>
						<Fab
							on:click={() =>
								fetch('/api/books/' + book.id, {
									method: 'DELETE'
								})
									.then(() => {
										location.reload();
									})
									.catch((err) => {
										$error = err.message;
									})}
							mini
						>
							<Icon class="material-icons">delete</Icon>
						</Fab>
						<Fab on:click={() => removeOneToOrder(books, book)} mini>
							<Icon class="material-icons">remove</Icon>
						</Fab>
						<Fab on:click={() => addOneToOrder(books, book)} mini>
							<Icon class="material-icons">add</Icon>
						</Fab>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/await}

{#if hasRolePermission(UserPermission.MODIFY_BOOKS, $page.data.user?.role)}
	<Add open={openAddDialog} {statusList} />
	{#if editBook}
		<Edit open={openEditDialog} book={editBook} {statusList} />
	{/if}
	<div class="add-button-container">
		<Fab style="width:80px;height:80px;" on:click={() => ($openAddDialog = true)}>
			<Icon class="material-icons" style="font-size:40px;">add</Icon>
		</Fab>
	</div>
{/if}

<style lang="scss">
	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;
		--mdc-theme-secondary: limegreen;
	}

	.admin-buttons {
		position: absolute;
		right: 40px;
	}

	.book {
		margin: 5px;
		* {
			display: inline-block;
		}
		p {
			color: #777;
			margin: 4px;
		}
	}

	#fab-container {
		--mdc-theme-secondary: limegreen;
	}
</style>
