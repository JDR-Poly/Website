<script lang="ts">
	import { writable } from "svelte/store";

	// Liste de questions / réponses
	const qnaItems = [
		{
            question: "Comment se passe une nocturne ?",
            answer: "Une Nocturne est une soirée où plusieurs tables de Jeu de Rôle sont proposées.  La soirée commence par une courte introduction de JDR-Poly puis chaque Maître de Jeu (MJ) présente alors, devant les participants, son scénario. Les participants choisissent ensuite le scénario et maître de jeu qui les intéresse puis sont répartis dans différentes salles sur le campus pour pouvoir jouer. Le temps estimé des parties est d'environ 3h."
        },
        {
            question: "Puis-je participer aux Nocturnes même si je ne suis pas étudiant•e ?",
            answer: "Bien sûr ! Nos Nocturnes sont ouvertes à toutes et tous, peu importe votre formation ou votre âge."
        },
        {
            question: "Ai-je besoin de connaître des systèmes de règles de jeux de rôle pour venir aux nocturnes ?",
            answer: "Non, aucune préparation n'est nécessaire pour participer à nos soirées Jeu de Rôle. Les systèmes de jeux sont souvent des créations originales concoctées avec soin par nos maîtres de jeu."
        },
        {
            question: "Ai-je besoin d'apporter un certain matériel en nocturne ?",
            answer: "Non, nous fournissons tout le matériel nécessaire. Cependant, il peut être pratique d'apporter de quoi écrire et du papier."
        },
        {
            question: "Les parties proposées durant les Nocturnes sont-elles des one-shots ou des campagnes ?",
            answer: "Durant nos Nocturnes, nous proposons une variété de one-shots, c'est-à-dire de courts scénarios de jeu de rôle d'environ 3 heures qui se terminent en une seule soirée.\nConcernant les campagnes, il est tout à fait possible de s'organiser avec les autres membres de JDR-Poly via notre serveur Discord."
        },
        {
            question: "Puis-je proposer une partie en tant que maître de jeu ?",
            answer: "Oui, vous pouvez évidemment proposer votre one-shot lors de nos Nocturnes ! Il vous suffira d'écrire un titre pour votre partie sur le tableau et de faire une courte présentation en même temps que les autres maîtres de jeu."
        },
        {
            question: "Can I come as an English speaker?",
            answer: "Yes, you can come even if you don't speak French. However, as our game masters are volunteers, we can't guarantee that there will always be a game in English."
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
