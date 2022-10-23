// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Role } from "$lib/backend/userPermission"
import type { User } from "./types"

// and what to do when importing types
declare global {
	declare namespace App {

		interface Error {
			message?: string,
			status?: number
		}

		interface Locals {
			authenticated: boolean,
			user?: User
		}
	}
}
