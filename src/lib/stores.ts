import { writable, type Writable } from "svelte/store";

const error: Writable<string|undefined> = writable()
const warning: Writable<string|undefined> = writable()
const info: Writable<string|undefined> = writable()

export { error, warning, info }