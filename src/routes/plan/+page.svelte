<svelte:head>
	<title>Accès | JDRPoly</title> 
</svelte:head>

<main>
	<h2>PLan d'accès</h2>
	<p>La majorité de nos événements ont lieu sur le campus de l'EPFL dans les salles du batiment INM. Voici quelques instructions sur comment t'y rendres ainsi qu'une carte. La salle appropriée pour l'événement sera toujours indiquée sur l'affiche ou sur notre site web.</p>

	<ul>
		<li> Depuis le métro M1 (arrêt EPFL), sortir et descendre dans le sous-voie</li>
		<li>Aller vers le campus de l'epfl et monter les marches puis continuer le long des batiments</li>
		<li>Au bout de cette ligne droite a gauche se trouvera une place, à droite une passerelle, prendre cette dernière</li>
		<li>Suivre la passerelle, jusqu'à arriver devant le batiment INM.</li>
	</ul>
	<p>Lien de Plan EPFL de l'entrée du batiment: <a href="https://plan.epfl.ch//?room==INM%20194.0">Plan EPFL</a></p>

	<img src="/images/access/plan.png" alt="plan accès INM">
</main>



<style lang="scss">
	main {
		width: 70%;
		margin: 8em auto;

		h2 {
			font-family: 'Ubuntu';
			text-transform: uppercase;
			font-weight: 600;
			letter-spacing: 0.15em;
			margin-bottom: 15px;
		}

		p,li {
			white-space: pre-line;
			text-align: justify;
			margin-bottom: 2em;
			color: #777;
			font-family: 'Ubuntu';
		}
		p {
			line-height: 27px;
		}
		ul {
			margin-left: 40px;
		}

		img {
			padding: 1em;
			border: 1px solid gray;
			max-width: 60vw;
		}
	}
</style>