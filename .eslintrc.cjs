/** @format */

module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"plugin:svelte/prettier",
	],
	plugins: ["@typescript-eslint"],
	ignorePatterns: ["*.cjs", "**/components/ui/*"],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"],
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
			},
		},
	],
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
};
