<script lang="ts">
	import Add from './Add.svelte';
	import { writable } from 'svelte/store';
	import { error, warning } from '$lib/stores';
	import { hasRolePermission, UserPermission } from '$lib/userPermissions';
	import Edit from './Edit.svelte';
	import { __sortByItemOrder } from './+page';
	import type { Book } from '$gtypes';
	import type { PageData } from './$types';
	import IconButton from '$components/IconButton.svelte';
	import Icon, { iconExists } from '@iconify/svelte';
	import { text } from '@sveltejs/kit';

	const openAddDialog = writable(false);
	const openEditDialog = writable(false);

	export let data: PageData;

	let isAChange = false; //Indicate if the order was changed and the new order need to be saved

	let bookList: Book[] = data.books;

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
		isAChange = true;
		bookList = [...__sortByItemOrder(books)];
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
		isAChange = true;
		bookList = [...__sortByItemOrder(books)];
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

	const statusList = ['Disponible', 'Indisponible', 'WANTED', 'Collector'];
	let editBook: Book | undefined = undefined;
</script>

<svelte:head>
	<title>Livres | JDRPoly</title>
	<meta name="description" content="Livres de jeux de rôle empruntable.">
</svelte:head>

<main>
	<h2>Livres :</h2>

	<p>
		Bienvenue sur la magnifique page de la bibliothèque de JDR-Poly. Tu as toujours voulu essayer
		d'être MJ dans un de tes univers préférés ? Tu es un passionné des mondes de fiction et
		de leur lore ? Voici une liste de livres dont nous disposons et qui (on l'espère) feront ton
		bonheur et celui de tes joueurs. Si tu veux réserver un livre, nous poser une question sur une
		date de retour prévue ou nous envoyer plein de coeurs, utilise le petit formulaire juste en
		dessous.
	</p>
	<ul>
		{#each bookList as book}
			<li class="book">
				<p> {book.title} | </p> 
					{#if book.status == 'Disponible' || book.status == 'Indisponible'}
						<b>Disponible:</b> <Icon icon={book.status == 'Disponible' ? 'material-symbols:done' : 'material-symbols:close'} style="font-size:22px; color:black;" inline={true}/>
					{:else}
						<b>{book.status}</b>
					{/if}
				<br />
				<p>
					<i>Caution: {book.caution} CHF</i>
				</p>
				{#if hasRolePermission(UserPermission.MODIFY_BOOKS, data.user?.role)}
					<div class="admin-buttons">
						<IconButton icon="material-symbols:edit" action={() => {
							if (isAChange) {
								$warning = "Vous devez d'abord sauvegarder l'ordre";
								return;
							}
							editBook = book;
							$openEditDialog = true;
						}}
						label={`Éditer le livre ${book.title}`}
						/>
						<IconButton icon="material-symbols:delete" action={() =>
							fetch('/api/books/' + book.id, {
								method: 'DELETE'
							})
								.then(() => {
									location.reload();
								})
								.catch((err) => {
									$error = err.message;
								})} 
								label={`Supprimer le livre ${book.title}`}/>
						<IconButton icon="material-symbols:remove" action={() => removeOneToOrder(bookList, book)} label="Descendre l'ordre du le livre"/>
						<IconButton icon="material-symbols:add" action={() => addOneToOrder(bookList, book)} label="Monter l'ordre du livre"/>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</main>

{#if hasRolePermission(UserPermission.MODIFY_BOOKS, data.user?.role)}
	<Add open={openAddDialog} {statusList} />
	{#if editBook}
		<Edit open={openEditDialog} book={editBook} {statusList} />
	{/if}
	{#if isAChange}
		<div id="save-container">
			<IconButton action={() => updateOrders(bookList)} text="Sauvegarder" icon="material-symbols:done" inline={true} label="Enregistrer l'ordre des livres"/>
		</div>
	{/if}
	<div class="add-button-container">
		<IconButton action={() => ($openAddDialog = true)} icon="material-symbols:add" inline={true} label="Ajouter un livre"/>
	</div>
{/if}

<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;
		min-height: 40vh;

		h2 {
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
		:global(button) {
			background-color: limegreen;
			border-radius: 200px;
		}

		:global(svg) {
			font-size: 60px;
		}
	}

	.admin-buttons {
		position: absolute;
		right: 40px;

		:global(svg) {
			color: black;
			padding: 5px;
			font-size: 25px;
			border-radius: 25px;
			
			&:hover {
				background-color: lightgray;
			}
		}
	}

	#save-container {
		position: fixed;
		bottom: 40px;
		left: 40px;

		:global(button) {
			background-color: limegreen;
			font-size: 20px;
			padding: 10px 15px;
			border-radius: 20px;
			color: white;
		}
	}
</style>
