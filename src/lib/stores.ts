import type { User } from "src/types";
import { writable, type Writable } from "svelte/store";

const authenticated = writable(false);
const user: Writable<User> = writable()

const error: Writable<string|undefined> = writable()
const warning: Writable<string|undefined> = writable()
const info: Writable<string|undefined> = writable()

export { authenticated, user, error, warning, info }