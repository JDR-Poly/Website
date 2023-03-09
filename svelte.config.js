import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		scss: {
		  prependData: `@import './static/sass/_variables.scss';`
		}
	 }),

	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$gtypes: 'src/types.ts'
		}
	}
};

export default config;
