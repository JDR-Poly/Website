/** @format */

import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
/** @format */

import adapter from "@sveltejs/adapter-node";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			scss: {
				prependData: `@import './static/sass/_variables.scss';`,
			},
		}),
		vitePreprocess({}),
	],

	kit: {
		adapter: adapter(),
		alias: {
			$components: "src/lib/components",
			$gtypes: "src/types.ts",
			$utils: "src/lib/utils",
		},
		/*csp: {
            directives: {
                'script-src': ['self', 'https://challenges.cloudflare.com', 'https://ajax.cloudflare.com', 'ajax.cloudflare.com'],
				'object-src': ['self'],
				'frame-src' : ['self', 'https://challenges.cloudflare.com'] 
            },
			mode: "auto"
        }*/
	},
};

export default config;
