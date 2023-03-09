<script lang="ts">
	import { element, text } from 'svelte/internal';

	export let data: DdData;
	export let responsive: boolean;

	let open = true;

	$: if (responsive) {
		open = true;
	}

	type DdData = {
		//DropdownData
		element: DdElement;
		links: DdLink[];
		actions?: DdAction[];
	};
	type DdLink = {
		element: DdElement;
		link: string;
	};
	type DdAction = {
		element: DdElement;
		action: Action;
	};
	//An optional icon + a text
	type DdElement = {
		prefix_icon?: string;
		text: string;
	};

	type Action = () => any;
</script>

<div class="dropdown" class:responsive>
	<button
		class="drop-btn drop-element"
		on:click={() => {
			if (responsive) {
				open = !open;
			}
		}}
	>
		{#if data.element.prefix_icon}
			<span class="material-symbols-outlined icon">{data.element.prefix_icon}</span>
		{/if}
		<p>{data.element.text}</p>
		<span class="material-symbols-outlined icon">expand_more</span>
	</button>
	<div class="drop-content" class:closed={!open}>
		{#each data.links as element}
			<a href={element.link} class="drop-link drop-element">
				{#if element.element.prefix_icon}
					<span class="material-symbols-outlined icon">{element.element.prefix_icon}</span>
				{/if}
				<p>{element.element.text}</p>
			</a>
		{/each}
		{#if data.actions}
			{#each data.actions as ddaction}
				<button on:click={ddaction.action()} class="drop-link drop-element">
					{#if ddaction.element.prefix_icon}
						<span class="material-symbols-outlined icon">{ddaction.element.prefix_icon}</span>
					{/if}
					<p>{ddaction.element.text}</p>
				</button>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.drop-element {
		display: flex;
		align-content: center;
		align-items: center;
		text-align: center;
		text-decoration: none;
	}

	.dropdown {
		overflow: hidden;

		&:hover {
			.drop-content {
				display: block;
			}
		}
	}

	.drop-btn {
		padding: 7px 16px;
		font-size: 17px;
		background-color: $primary;
		color: $secondary;
		width: 100%;
		height: 100%;
		border: none;
		letter-spacing: 0.05em;
		font-family: Open Sans, sans-serif;

		&:hover {
			background-color: $primary-light;
		}
	}

	.drop-content {
		display: none;
		position: absolute;
		background-color: $secondary;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		z-index: 5;
		min-width: 200px;

		a,
		button {
			color: black;
			padding: 12px 16px;
			text-align: left;
			padding-left: 30px;
			cursor: pointer;
			font-family: 'Open Sans', sans-serif;
			font-size: 16px;

			&:hover {
				background-color: #ddd;
			}
		}

		button {
			border: none;
			width: 100%;
			background-color: inherit;
		}
	}

	.icon {
		margin-right: 4px;
	}

	@media screen and (max-width: 1300px) {
		.dropdown.responsive {
			.drop-content {
				position: static;
				display: block;
				background-color: $primary;

				a,
				button {
					color: $secondary;

					&:hover {
						background-color: $primary-light;
					}
				}
			}
			.closed {
				display: none;
			}
		}
	}
</style>
