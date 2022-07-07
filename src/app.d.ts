// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	
	interface Locals {
		authenticated: boolean,
		email?: string,
		profileId?: number
	}
	interface Session {
		authenticated: boolean,
		email?: string,
		profileId?: number
	}
	// interface Platform {}
	// interface Stuff {}
}

