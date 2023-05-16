import { sendMail } from "$lib/server/mailClient"
import { __envDir } from "$lib/utils";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types"
import { readFile } from 'fs/promises';

/**
 * Send a contact email to JDR-Poly
 * 
 * @param {string} email the email of the author
 * @param {string} name the name of the author
 * @param {string} text the text of the author
 */
export const POST = (async ({ request }) => {
	const body = await request.json()
	if(!body.name || !body.email || !body.text) throw error(400, "Missing parameter(s)")

	let text =  await readFile(__envDir + 'mails/contactForm.html', 'utf-8')
	text = text.replace('%NAME%', body.name)
	text = text.replace('%EMAIL%', body.email)
	text = text.replace('%TEXT%', body.text)
	const result = await sendMail("informatique@jdrpoly.ch", `Contact form : ${body.name}`, text)
	
	if(result instanceof Error) {
		throw error(500, result);
	} else {
		return new Response()
	}

}) satisfies RequestHandler