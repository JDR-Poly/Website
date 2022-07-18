import type { Role } from "$lib/userPermissions";
import { writable, type Writable } from "svelte/store";

const authenticated = writable(false);
const profileId = writable(0);
const email = writable("");
const role: Writable<Role> = writable()

export {authenticated, profileId, email, role}