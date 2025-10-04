import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import {
        PUBLIC_WEBSITE_VERSION,
} from '$env/static/public';

export const GET = (async ({ locals }) => {
    return json( PUBLIC_WEBSITE_VERSION );
}) satisfies RequestHandler;

