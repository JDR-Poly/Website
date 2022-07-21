import type { User } from "src/types";
import { writable, type Writable } from "svelte/store";

const authenticated = writable(false);
const user: Writable<User> = writable()

export {authenticated, user}