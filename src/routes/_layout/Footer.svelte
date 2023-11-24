<!-- @format -->
<script type="ts">
	import Textfield from "@smui/textfield";
	import { applyAction, enhance } from "$app/forms";
	import { error, info } from "$lib/stores";
	import { Turnstile } from "svelte-turnstile";
	import Icon from "@iconify/svelte";

	let isEmailInvalid = true;
	let email = "";
	let name = "";
	let message = "";
</script>

<footer>
	<div id="contact">
		<div id="form">
			<form
				method="POST"
				action="/contact?/sendMail"
				use:enhance={({}) => {
					return async ({ result, update }) => {
						if (result.type == "success") {
							$info = "Le mail a correctement été envoyé.";
							update();
						} else if (result.type === "error" && result.error.message) {
							$error = result.error.message;
							console.error(result.error);
						}
						await applyAction(result);
					};
				}}
			>
				<div id="info">
					<Textfield
						class="email"
						type="email"
						bind:invalid={isEmailInvalid}
						updateInvalid
						bind:value={email}
						label="Email"
						input$autocomplete="email"
						input$name="email"
					/>
					<Textfield class="name" type="text" input$name="name" bind:value={name} label="Nom" />
				</div>
				<div id="textarea">
					<Textfield textarea input$name="text" bind:value={message} label="Message" />
				</div>
				{#if import.meta.env.PROD}
					<Turnstile siteKey="0x4AAAAAAAE1uyTWfzpY2dHE" />
				{/if}
				<button disabled={!(email && name && message && !isEmailInvalid)}>Envoyer</button>
			</form>
		</div>
		<div id="links">
			<section>
				<Icon icon="material-symbols:mail-outline" class="footer-icon" />
				<h3>Email</h3>
				<a href="mailto:comite@jdrpoly.ch">comite@jdrpoly.ch</a>
			</section>
			<section>
				<!-- Social media -->
			</section>
		</div>
	</div>
	<div id="bottom">
		<p>
			© JDRpoly 2015-2023. All rights reserved. | Home page design: Inspired by <a
				href="http://html5up.net/"
				target="_blank"
				rel="noreferrer">HTML5 UP</a
			>
		</p>
	</div>
</footer>

<style lang="scss">
	footer {
		overflow-x: hidden;
		background-color: $secondary;
		padding: 8em 0 4em 0;
	}

	#contact {
		margin: 0 auto;
		padding: 0 0 4em 0;
		max-width: 90rem;
		width: calc(100% - 6em);
		display: flex;
		border-bottom: solid 3px $secondary-dark;
	}

	#form {
		border-right: solid 2px $primary;
		width: 58%;

		form {
			padding: 0 6em 2em 0;

			button {
				padding: 1.2em 3em;
				background-color: #01184d;
				border: solid 1px #01184d;
				color: $secondary;
				font-size: 1.1em;
				letter-spacing: 5px;
				text-align: center;
				cursor: pointer;

				&:hover {
					background-color: #062a6c;
					border: solid 1px white;
				}
			}
		}
		#info {
			:global(.email) {
				float: left;
			}

			:global(.name) {
				float: right;
			}

			:global(label) {
				margin-bottom: 2em;
				width: 48%;
			}
		}

		#textarea {
			width: 100%;
			margin-bottom: 3em;

			:global(label) {
				width: 100%;
				padding: 0.75em 1em;
				min-height: 225px;
			}
		}
	}

	#links {
		width: 40%;
		padding: 0 0 0 4em;

		section {
			height: 30%;
			position: relative;
			color: $primary;

			h3 {
				padding-top: 2px;
				color: inherit;
				font-weight: 600;
				line-height: 1.65;
				font-size: 27px;
				margin-bottom: 1em;
				letter-spacing: 0.025em;
			}

			a {
				border-bottom: dotted 1px;
				color: inherit;
				text-decoration: none;
				letter-spacing: 0.1em;
				font-size: 18px;
			}

			:global(.footer-icon) {
				background-color: #ffffff;
				font-size: 15px;
				padding: 5px;
				border-radius: 100%;
				color: #242943;
				height: 2em;
				line-height: 2em;
				text-align: center;
				transform: translateY(10%);
				width: 2em;
			}

			&:first-child {
				padding: 4em 0 0 3em;
				:global(.footer-icon) {
					position: absolute;
					left: 0;
				}
			}

			&:last-child {
				padding: 4em 0 0 1em;
				a {
					display: inline-block;
					border: none;
					margin: 0 0.5em;
					cursor: pointer;
				}
			}
		}
	}

	#bottom {
		text-align: center;
		margin-top: 2em;
		color: #777;

		a {
			color: #777;
		}
	}

	@media screen and (max-width: 700px) {
		#contact {
			display: block;

			#form {
				width: 100%;
				padding: 0;
				margin: 0 auto;
				border: none;

				form {
					padding: 0;
				}
			}
			#links {
				width: 100%;
				padding: 0;

				section {
					left: -2em;
				}
			}
		}
	}
</style>
