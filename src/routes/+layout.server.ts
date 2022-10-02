import { db } from "$lib/server/postgresClient";
import type { RequestEvent } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request, locals, setHeaders }: RequestEvent) {
    return {
        authenticated: locals.authenticated,
        user: locals.user
    };
}