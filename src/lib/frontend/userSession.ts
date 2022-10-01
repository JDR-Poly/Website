import type { LoadEvent } from "@sveltejs/kit";
import type { Writable } from 'svelte/store';

/**
 * Extract data of the session and put them in already created writable
 * @param {LoadEvent} event the module load event
 * @param {Record<string, Writable<any>>} data dictionary of writable, where the name of the writables are the same as the data of the session  
 */
function getUserSessionData(event: LoadEvent, data: Record<string, Writable<any>>) {
	const keys = Object.keys(data)
	for (const key in data) {
		data[key].set((event.session as any)[key])
	}
} 

export {getUserSessionData}