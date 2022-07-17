// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Role } from "$lib/backend/userPermission"

// and what to do when importing types
declare global {
	declare namespace App {
		
		interface Locals {
			authenticated: boolean,
			email?: string,
			profileId?: number,
			role?: Role
		}
		interface Session {
			authenticated: boolean,
			email?: string,
			profileId?: number,
			role?: Role
		}
		// interface Platform {}
		// interface Stuff {}
	}
}
