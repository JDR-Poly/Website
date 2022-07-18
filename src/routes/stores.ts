import type { User } from "src/types";
import { writable, type Writable } from "svelte/store";

const authenticated = writable(false);
const profileId = writable(0);
const email = writable("");
const user: Writable<User> = writable()

export {authenticated, profileId, email, user}