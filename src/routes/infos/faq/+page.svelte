<script lang="ts">
	import { writable } from "svelte/store";

	// Liste de questions / réponses
	const qnaItems = [
		{
			question: "Comment devevnir membre JDRPoly ?",
			answer:
				"Vous pouvez venir à une nocturne et payer 5 CHF. Vous devrez donner une adresse mail et créer un compte sur ce site avec cette même adresse mail.\n Une fois ceci fait, vous serez ajouté en tant que membre quelques jours plus tard et vous pourrez vous inscrire aux soirées membres."
		},
		{
			question: "Est-ce que je peux participer aux nocturnes même si je ne suis pas membre ?",
			answer:
				"OUI ! Vous pouvez absolument venir. Que vous n'ayez jamais fait de JDR ou que vous soyez un vétéran, tout le monde est le bienvenu"
		},
		{
			question: "Où ce passent ces nocturnes ?",
			answer:
				"Elles se passent en INM 202 un mercredi sur deux. Vous pouvez voir comment y accéder dans Informations, puis dans Accès."
		}
	];

	// Indices des questions ouvertes
	let openIndexes = writable<number[]>([]);

	// Fonction de toggle
	function toggleItem(index: number) {
		openIndexes.update((current) =>
			current.includes(index)
				? current.filter((i) => i !== index)
				: [...current, index]
		);
	}
</script>

<main class="qna-container">
	<h2>Questions & Réponses</h2>

	<div class="qna-list">
		{#each qnaItems as item, i}
			<div class="qna-item">
				<!-- Barre "Titre + flèche" -->
				<button
					class="qna-question"
					on:click={() => toggleItem(i)}
					aria-expanded={$openIndexes.includes(i)}
				>
					<!-- Le texte de la question -->
					<span class="qna-text">{item.question}</span>
					<!-- La flèche à droite, style "▸" / "▾" -->
					<span class="icon">
						{ $openIndexes.includes(i) ? "▾" : "▸" }
					</span>
				</button>

				<!-- Réponse si la question est ouverte -->
				{#if $openIndexes.includes(i)}
					<p class="qna-answer">{item.answer}</p>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style lang="scss">
/* CENTRAGE GLOBAL, similaire à la page comité */
.qna-container {
	margin: 0 auto;
	width: 80%;
	max-width: 900px;
	padding: 2rem 0;

	h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}
}

/* LISTE DES Q&A */
.qna-list {
	.qna-item {
		/* Séparateur entre chaque item, comme le trait dans la page comité */
		border-bottom: 1px solid #eee;
		padding: 1rem 0;

		/* Le bouton qui affiche la question + la flèche */
		.qna-question {
			width: 100%;
			background: none;
			border: none;
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 1.1rem;
			font-weight: 600;
			color: #333;
			padding: 0;
			transition: color 0.2s ease;

			.qna-text {
				/* Pour séparer le texte de la flèche si besoin */
				margin-right: 1em;
			}

			.icon {
				font-size: 1.3rem;
				color: #333;
				/* On peut ajouter un petit effet hover si on veut */
			}

			&:hover {
				color: #000;
			}
		}

		/* La réponse */
		.qna-answer {
			margin-top: 0.5rem;
			padding: 0.5rem 0;
			color: #333;
			line-height: 1.4;
		}
	}
}
</style>
