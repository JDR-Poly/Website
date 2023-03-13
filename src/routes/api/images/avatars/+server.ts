import { __envDir } from "$lib/utils";
import { error, json } from "@sveltejs/kit";
import { writeFileSync } from 'fs';
import type { RequestEvent } from "./$types";

/** 
 * Allows a user to post their avatars
 * @param {image} request.image
 * @type {import('./$types').RequestHandler} 
 */
 export async function POST({ request, locals, url }: RequestEvent) {
	if(!locals.authenticated) throw error(401)

	const body = await request.json()
		
	if(!body.image) throw error(400) 

	try {
		writeFileSync(__envDir + `avatars/` + locals?.user?.id +`.png`, body.image, 'base64')

		return json({link: url.origin + '/static/avatars/' + locals?.user?.id +`.png`})
	} catch(err: any) {
		throw error(500, err?.message)
	}
}	