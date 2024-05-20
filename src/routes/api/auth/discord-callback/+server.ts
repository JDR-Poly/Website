/** @format */

import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { env } from "$env/dynamic/private";
import { env as envpub } from "$env/dynamic/public";
import type { RequestHandler } from "./$types";
import axios from "axios";

export const GET = (async ({ url, cookies, locals }) => {
	if (!locals.authenticated) throw error(401);

	const code = url.searchParams.get('code')
	if (code == null) throw error(403, "missing code param")
	const state = url.searchParams.get('state')
	const validate_state = cookies.get('oauth2_state')
	if (state == null || state != validate_state) throw error(403, "invalid state");

	const auth = {
		'client_id': envpub.PUBLIC_DISCORD_CLIENT_ID,
		'client_secret': env.DISCORD_CLIENT_SECRET
	}
	const form_header = {
		'Content-Type': 'application/x-www-form-urlencoded'
	}

	const token_resp = await axios.post('https://discord.com/api/oauth2/token',
		new URLSearchParams({
			...auth,
			'grant_type': 'authorization_code',
			'redirect_uri': envpub.PUBLIC_DISCORD_REDIRECT_URI,
			'code': code!
		}),
		{ headers: form_header }
	).catch(err => {
		throw error(500, err.message)
	})

	const token = token_resp.data.access_token

	const user_resp = await axios.get('https://discordapp.com/api/users/@me',
		{ headers: {
			'Authorization': `Bearer ${token}`
		}}
	).catch(err => {
		throw error(500, err.message)
	})

	const discord_id = user_resp.data.id

	await axios.post('https://discord.com/api/oauth2/token/revoke',
		new URLSearchParams({
			...auth,
			'token': token,
			'token_type_hint': 'access_token'
		}),
		{ headers: form_header }
	).catch(err => {
		throw error(500, err.message)
	})

	db.none(`UPDATE users SET discord_id=$1 WHERE id=$2`, [discord_id, locals.user?.id])
		.catch((err) => {
			throw error(500, err.message);
		});
	throw redirect(302, "/users/account/settings")
}) satisfies RequestHandler;
