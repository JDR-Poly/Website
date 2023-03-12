<script lang="ts">
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import Fab, { Icon, Label } from '@smui/fab';
	import { error, warning } from '$lib/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import { page } from '$app/stores';
	import Edit from './Edit.svelte';
	import { _sortByItemOrder } from './+page';
	import type { Book } from '$gtypes';
	const openAddDialog = writable(false);
	const openEditDialog = writable(false);

	export let data: any;

	let change = false; //Indicate if the order was changed and the new order need to be saved
	
	let bookList: Book[] = data.books

	function addOneToOrder(books: Book[], current_book: Book) {
		//Change the order of the committes
		const nextBook = books.filter((v: Book) => {
			return v.item_order === current_book.item_order + 1;
		});

		if (nextBook.length < 1) return;

		nextBook.forEach((v: any) => {
			v.item_order--;
		});

		current_book.item_order++;
		change = true;
		bookList = [..._sortByItemOrder(books)]
	}

	function removeOneToOrder(books: Book[], current_book: Book) {
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
		bookList = [..._sortByItemOrder(books)]		
	}

	async function updateOrders(books: Book[]) {
		fetch('/api/books/', {
				method: 'PATCH',
				body: JSON.stringify(books)
			})
				.then(() => {
					location.reload();
				})
				.catch((err) => {
					$error = err.message;
				});
	}

	const statusList = ['Disponible', 'Indisponible'];
	let editBook: Book | undefined = undefined;
</script>

<svelte:head>
	<title>Livres | JDRPoly</title> 
</svelte:head>

<main>
	<h2>Livres :</h2>

	<p>Bienvenue sur la magnifique page de la bibliothèque de JdrPoly.
		Tu as toujours voulu essayé d'être mj dans un de tes univers préféré ? ou alors t'es un passionné des mondes de fiction et de leur lore ?
		Voici une liste de livres dont nous disposons et qui (on l'espère) feront ton bonheur et celui de tes joueurs.
		Si tu veux réserver un livre, nous poser une question sur une date de retour prévue ou nous envoyer plein de coeur, utilise le petit formulaire juste en dessous.</p>
	<ul>
		{#each bookList as book}
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
						<Fab on:click={() => removeOneToOrder(bookList, book)} mini>
							<Icon class="material-icons">remove</Icon>
						</Fab>
						<Fab on:click={() => addOneToOrder(bookList, book)} mini>
							<Icon class="material-icons">add</Icon>
						</Fab>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</main>

{#if hasRolePermission(UserPermission.MODIFY_BOOKS, $page.data.user?.role)}
	<Add open={openAddDialog} {statusList} />
	{#if editBook}
		<Edit open={openEditDialog} book={editBook} {statusList} />
	{/if}
	{#if change}
		<div id="fab-container">
			<Fab color="secondary" on:click={() => updateOrders(bookList)} extended>
				<Icon class="material-icons">done</Icon>
				<Label>Sauvegarder</Label>
			</Fab>
		</div>
	{/if}
	<div class="add-button-container">
		<Fab style="width:80px;height:80px;" on:click={() => ($openAddDialog = true)}>
			<Icon class="material-icons" style="font-size:40px;">add</Icon>
		</Fab>
	</div>
{/if}

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;

		h2 {
			font-family: 'Ubuntu';
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		p {
			white-space: pre-line;
			line-height: 27px;
			text-align: justify;
			margin-bottom: 2em;
			color: #777;
			font-family: 'Ubuntu';
		}

		.book {
			margin: 5px;
			margin-bottom: 0.5em;
			* {
				display: inline-block;
			}
			p {
				color: #777;
				margin: 4px;
			}
		}
	}
	.add-button-container {
		position: fixed;
		bottom: 40px;
		right: 40px;
		--mdc-theme-secondary: limegreen;

		:global(.mdc-fab__icon) {
			color: $secondary;
		}
	}

	.admin-buttons {
		position: absolute;
		right: 40px;
	}

	#fab-container {
		position: fixed;
		bottom: 40px;
		left: 40px;

		:global(.mdc-fab) {
			background-color: limegreen;
		}
	}

	:global(#fab-container .mdc-fab__label, #fab-container .mdc-fab__icon) {
		color: $secondary;
	}
</style>
