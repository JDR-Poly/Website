<!-- @format -->
<script type="ts">
	import { applyAction, enhance } from "$app/forms";
	import { error, info } from "$lib/stores";
	import { Turnstile } from "svelte-turnstile";
	import Icon from "@iconify/svelte";
	import { Textarea } from "$lib/components/ui/textarea";
	import Input from "$components/ui/input/input.svelte";

	let isEmailInvalid = true;
	let email = "";
	let name = "";
	let message = "";
</script>

<footer>
	<div id="contact" class="block md:flex">
		<div
			id="form"
			class="max-md:border-b-2 max-md:pb-8 md:border-r-2 border-cprimary w-full md:w-3/5 md:pr-12"
		>
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
				<div id="info" class="flex my-2">
					<Input type="email" placeholder="Email" class="mx-0.5" bind:value={email} name="email" />
					<Input type="text" placeholder="Nom" class="mx-0.5" bind:value={name} name="name" />
				</div>
				<div id="textarea" class="h-fit mb-3">
					<Textarea name="text" bind:value={message} placeholder="Message" class="h-40" />
				</div>
				{#if import.meta.env.PROD}
					<Turnstile siteKey="0x4AAAAAAAE1uyTWfzpY2dHE" />
				{:else}
					<Turnstile siteKey="1x00000000000000000000AA" theme="light" />
				{/if}
				<button disabled={!(email && name && message && !isEmailInvalid)}>Envoyer</button>
			</form>
		</div>
		<div id="links" class="w-full md:w-2/5">
			<section class="pt-5 pl-8">
				<h3 class="md-3">
					<Icon icon="material-symbols:mail-outline" inline={true} class="inline-block mr-2" />Email
				</h3>
				<a href="mailto:comite@jdrpoly.ch">comite@jdrpoly.ch</a>
			</section>
			<section>
				<!-- Social media -->
				<!-- TODO -->
			</section>
		</div>
	</div>
	<div id="bottom">
		<p>
			© JDRpoly 2015-2024. All rights reserved. | Home page design: Inspired by <a
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
		border-bottom: solid 3px $secondary-dark;
	}

	form button {
		padding: 1.2em 2em;
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

	#links {
		section {
			height: 30%;
			position: relative;
			color: $primary;

			h3 {
				color: inherit;
				font-weight: 600;
				line-height: 1.65;
				font-size: 27px;
				letter-spacing: 0.025em;
			}

			a {
				border-bottom: dotted 1px;
				color: inherit;
				text-decoration: none;
				letter-spacing: 0.1em;
				font-size: 18px;
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
</style>
