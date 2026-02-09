<!-- @format -->
<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { warning, info, error } from "$lib/stores";
	import { goto, invalidateAll } from "$app/navigation";
	import { Input } from "$lib/components/ui/input";
	import { Turnstile } from "svelte-turnstile";
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";
	import InfiniteProgress from "$components/InfiniteProgress.svelte";
	import {
		PUBLIC_TURNSTILE_KEY,
	} from '$env/static/public';

	let lastName = "";
	let firstName = "";
	let email = "";
	let password = "";

	enum form {
		LOGIN = "Connexion",
		REGISTER = "Inscription",
		PASSWORD_LOST = "Récupération",
	}

	let formType = form.LOGIN;

	const EMAIL_REGEX = new RegExp("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$");

	let loading = false;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{formType} | JDR-Poly</title>
	<meta name="title" content={`${formType} | JDR-Poly`} />
	<meta name="description" content={formType} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content={`${formType} | JDR-Poly`} />
	<meta property="og:description" content={formType} />
</svelte:head>

<main>
	<img src="/images/events/banner.webp" alt="banner" width="1920" height="300" />
	<div id="form-wrapper">
		<div id="logo">
			<object type="image/svg+xml" data="/images/logo-black.svg" title="Logo JDR-Poly">
				<h3>Logo JDR-Poly</h3>
			</object>
		</div>

		<div id="form">
			<div id="input">
				{#if formType == form.LOGIN}
					<form
						method="POST"
						action="?/login"
						use:enhance={({}) => {
							loading = true;
							const timeoutId = setTimeout(() => {
								loading = false;
							}, 6000);
							return async ({ result }) => {
								loading = false;
								clearTimeout(timeoutId);
								if (result.type == "failure") {
									$warning = `${result.data?.message}`;
									applyAction(result);
								} else if (result.type == "success") {
									const code = $page.url.searchParams.get("code");
									if (code)
										goto(`/?code=${code}`, { invalidateAll: true });
									else
										goto("/", { invalidateAll: true });
								}
							};
						}}
					>
						<Input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="Mail"
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>
						<Input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							placeholder="Mot de Passe"
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>

						{#if loading}
							<InfiniteProgress />
						{/if}

						<div class="button">
							<Button
								type="submit"
								disabled={!email || !password || email.match(EMAIL_REGEX) == null}
								class="w-full">Se connecter</Button
							>
						</div>
					</form>
				{:else if formType == form.REGISTER}
					<form
						class="register-input"
						method="POST"
						action="?/register"
						use:enhance={({}) => {
							loading = true;
							const timeoutId = setTimeout(() => {
								loading = false;
							}, 6000);
							return async ({ result }) => {
								loading = false;

								if (result.type == "failure") {
									$warning = `${result.data?.message}`;
									applyAction(result);
								} else if (result.type == "success") {
									const code = $page.url.searchParams.get("code");
									if (code)
										goto(`/?code=${code}`, { invalidateAll: true });
									else
										goto("/", { invalidateAll: true });
								}
							};
						}}
					>
						<Input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="Mail"
							required
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>

						<Input
							id="lastname"
							name="lastname"
							type="text"
							bind:value={lastName}
							placeholder="Nom"
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>
						<Input
							id="firstname"
							name="firstname"
							type="text"
							bind:value={firstName}
							placeholder="Prénom"
							required
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>

						<Input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							placeholder="Mot de Passe"
							required
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
						/>

						<Turnstile siteKey={PUBLIC_TURNSTILE_KEY} theme="light" />
						
						{#if loading}
							<InfiniteProgress />
						{/if}

						<div class="button">
							<Button
								type="submit"
								disabled={!email ||
									!password ||
									!firstName ||
									email.match(EMAIL_REGEX) == null}
								class="w-full"
								>S'inscrire
							</Button>
						</div>
					</form>
				{:else}
					<form
						method="POST"
						action="?/resetPassword"
						use:enhance={({}) => {
							loading = true;
							const timeoutId = setTimeout(() => {
								loading = false;
							}, 6000);
							return async ({ result, update }) => {
								loading = false;
								if (result.type == "failure") {
									$warning = `Le mail n'est pas valide`;
									console.error(result.data?.message);
									update();
								} else if (result.type == "success") {
									$info = "Un mail a été envoyé.";
									update();
									formType = form.LOGIN;
								}
							};
						}}
					>
						<Input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="Mail"
							class="my-4 py-6 bg-inherit border-slate-400 focus:border-transparent focus-visible:ring-1"
							required
						/>

						{#if loading}
							<InfiniteProgress />
						{/if}

						<div class="button">
							<Button
								type="submit"
								class="w-full"
								disabled={!email || email.match(EMAIL_REGEX) == null}
								>Demander un nouveau mot de passe
							</Button>
						</div>
					</form>
				{/if}
			</div>
			<div id="login-divider"><span><p>ou</p></span></div>
			<div id="other-form">
				{#if formType != form.REGISTER}
					<Button on:click={() => (formType = form.REGISTER)} class="w-full bg-[#031c57] my-1"
						>S'inscrire</Button
					>
				{/if}
				{#if formType != form.LOGIN}
					<Button on:click={() => (formType = form.LOGIN)} class="w-full bg-[#031c57] my-1"
						>Se connecter</Button
					>
				{/if}
				{#if formType != form.PASSWORD_LOST}
					<a on:click={() => (formType = form.PASSWORD_LOST)} href="/auth/login"
						>Mot de passe perdu ?</a
					>
				{/if}
			</div>
		</div>
	</div>
</main>

<style lang="scss">
	main {
		position: relative;
		min-height: 100vh;
		border-bottom: 1px solid gray;

		img {
			position: absolute;
			overflow-x: hidden;
			width: 70%;
			height: 100%;
			object-fit: cover;
			object-position: 50% 100%;
			display: block;
			left: 0;
			filter: blur(1px);
			-webkit-filter: blur(1px);
		}

		#form-wrapper {
			position: absolute;
			right: 0;
			overflow-x: hidden;
			background-color: $secondary;
			width: 30%;
			height: 100%;

			#logo {
				margin: 4em auto 2em auto;
				width: 50%;
				object {
					width: 100%;
				}
			}

			#form {
				width: 70%;
				margin: 1em auto;
				position: relative;
			}
			#input {
				:global(form > *) {
					margin: 1em 0;
				}
				:global(form.register-input > *) {
					margin: 0.5em 0;
				}
			}
		}

		#login-divider {
			position: relative;
			margin: 2em 0;

			span {
				line-height: 0.5;
				margin-bottom: 2em;
				margin-top: 2em;
				text-align: center;
				color: #707070;
				&::before,
				&::after {
					border-bottom: 1px solid #707070;
					content: "";
					height: 5px;
					position: absolute;
					top: 0;
					width: 20%;
				}
				&::before {
					margin-right: 15px;
					right: 53%;
				}

				&::after {
					left: 53%;
					margin-left: 15px;
				}
			}
		}

		#other-form {
			:global(.mdc-button) {
				background-color: #031c57;
			}

			a {
				margin: 1em 0;
				display: block;
			}
		}
		.button {
			margin: 0 auto !important;

			:global(.mdc-button) {
				padding: 20px 20px;
				width: 100%;
			}
		}
	}

	@media only screen and (max-width: 1200px) {
		main {
			#form-wrapper {
				width: 45%;
			}
		}
	}

	@media only screen and (max-width: 800px) {
		main {
			img {
				display: none;
			}
			#form-wrapper {
				width: 100%;
			}
		}
	}
</style>
