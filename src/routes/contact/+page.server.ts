/** @format */

import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { readFile } from "fs/promises";
import { __envDir } from "$lib/utils";
import { sendMail } from "$lib/server/mailClient";
import { validateToken } from "$lib/server/utilsServer";
export const actions = {
	/**
	 * Send a mail from the contact form
	 *
	 * @param {string} request.name
	 * @param {string} request.email
	 * @param {string} request.text
	 */
	sendMail: async ({ request, fetch }) => {
		const data = await request.formData();
		const formName = data.get("name")?.toString();
		const formEmail = data.get("email")?.toString();
		const formText = data.get("text")?.toString();

		if (!formName || !formEmail || !formText) return fail(400, { message: "Missing parameter(s)" });

		if (import.meta.env.PROD) {
			const captchaToken = data.get("cf-turnstile-response")?.toString();
			if (!captchaToken) return fail(400, { error: "no captcha" });
			const { success, error } = await validateToken(captchaToken, fetch);

			if (!success) return fail(400, { error: "invalid captcha" });
		}

		let text = await readFile(__envDir + "mails/contactForm.html", "utf-8");
		text = text.replace("%NAME%", formName);
		text = text.replaceAll("%EMAIL%", formEmail);
		text = text.replace("%TEXT%", formText);

		const result = await sendMail("informatique@jdrpoly.ch", `Contact form : ${formName}`, text);

		if (result instanceof Error) {
			return fail(500, { message: "Missing parameter(s)" });
		} else {
			return {
				sucess: true,
				message: "Mail correctly sent.",
			};
		}
	},
} satisfies Actions;
