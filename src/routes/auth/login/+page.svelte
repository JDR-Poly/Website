<script lang="ts">
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { applyAction, enhance } from "$app/forms";
	import { warning } from "$lib/stores"
	import { goto, invalidateAll } from "$app/navigation";
	import LinearProgress from '@smui/linear-progress';

	let username = '';
	let email = '';
	let password = '';

	enum form {
		LOGIN = "Connection",
		REGISTER = "Inscription",
		PASSWORD_LOST = "Récupération"
	}

	let formType = form.LOGIN

	const EMAIL_REGEX = new RegExp("^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")

	let loading = false
</script>

<svelte:head>
	<title>{formType} | JDRPoly</title> 
</svelte:head>

<main>
	<img src="/images/events/banner.png" alt="banner">
	<div id="form-wrapper">
		<div id="logo">
			<object type="image/svg+xml" data="/images/logo-black.svg" title="Logo jdrpoly">
				<h3>Logo jdrpoly</h3>
			</object>	
		</div>

		<div id="form">
			<div id="input">
				{#if formType == form.LOGIN}
					<form method="POST" action="?/login" 
						use:enhance={({ }) => {
							loading = true
							const timeoutId = setTimeout(() => {
								loading = false
							}, 6000)
							return async ({ result }) => {
								loading = false
								clearTimeout(timeoutId)
								if (result.type == "failure") {
									$warning = `${result.data?.message}`
									applyAction(result);
								} else if(result.type == "success") {
									goto('/')
									invalidateAll()
								}
							}
					}}>
						<Textfield input$name="email" type="email" bind:value={email} label="Mail" style="width: 100%" variant="outlined"/>
						<Textfield input$name="password" type="password" bind:value={password} label="Mot de Passe" style="width: 100%" variant="outlined"/>
		
						{#if loading}
							<LinearProgress indeterminate/>
						{/if}

						<div class="button">
							<Button on:click={() => ""} touch variant="unelevated" disabled={!email || !password || email.match(EMAIL_REGEX) == null}>
								<Label>Se connecter</Label>
							</Button>
						</div>
					</form>
				{:else if formType == form.REGISTER}
					<form class="register-input" method="POST" action="?/register" use:enhance={({ }) => {
						loading = true
						const timeoutId = setTimeout(() => {
							loading = false
						}, 6000)
						return async ({ result }) => {	

							loading = false

							if (result.type == "failure") {
								$warning = `${result.data?.message}`
								applyAction(result);
							} else if(result.type == "success") {
								invalidateAll()
								goto('/')
							}
						}
					}}>
						<Textfield input$name="username" type="text" bind:value={username} label="Nom Prénom" style="width: 100%" variant="outlined"/>
						<Textfield input$name="email" type="email" bind:value={email} label="Mail" style="width: 100%" variant="outlined"/>
						<Textfield input$name="password" type="password" bind:value={password} label="Mot de Passe" style="width: 100%" variant="outlined"/>
		
						{#if loading}
							<LinearProgress indeterminate/>
						{/if}

						<div class="button">
							<Button on:click={() => ""} touch variant="unelevated" disabled={!email || !password || !username || email.match(EMAIL_REGEX) == null}>
								<Label>S'inscrire</Label>
							</Button>
						</div>
					</form>
				{:else}
					<form method="POST" action="?/lostpassword">
						<Textfield type="email" bind:value={email} label="Mail" style="width: 100%" variant="outlined"/>
		
						<div class="button">
							<Button on:click={() => ""} touch variant="unelevated">
								<Label>Demander un nouveau mot de passe</Label>
							</Button>
						</div>
					</form>
				{/if}
			</div>
			<div id="login-divider"> <span><p>ou</p></span> </div>
			<div id="other-form">
				{#if formType != form.REGISTER}
					<div class="button">
						<Button on:click={() => formType = form.REGISTER} touch variant="unelevated">
							<Label>S'inscrire</Label>
						</Button>
					</div>
				{/if}
				{#if formType != form.LOGIN}
					<div class="button">
						<Button on:click={() => formType = form.LOGIN} touch variant="unelevated">
							<Label>Se connecter</Label>
						</Button>
					</div>
				{/if}
				{#if formType != form.PASSWORD_LOST}
					<a on:click={() => formType = form.PASSWORD_LOST} href="/auth/login">Mot de passe perdu ?</a>
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
			object-position: 100% 100%;
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
				right: -15px;
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
			
			span{
				line-height: .5;
				margin-bottom: 2em;
				margin-top: 2em;
				text-align: center;
				color: #707070;
				font-family: 'Ubuntu';
				&::before, &::after {
					border-bottom: 1px solid #707070;
					content: '';
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
			
			:global(.mdc-button ) {
				padding: 20px 20px;
				width: 100%;
			}
		}
	}
</style>
