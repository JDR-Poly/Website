/** @format */

// vite.config.js
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		/**
		 * Fix node-pre-gyp (added by bcrypt) wrong dependency declaration.
		 * @see https://stackoverflow.com/questions/77721584/react-vite-app-shows-the-error-no-loader-is-configured-for-html-files-se
		 */
		exclude: ["@mapbox"], 
	  },
};

export default config;
