import type {RequestEvent } from './$types';

/** @type {import('./$types').RequestHandler} */
export function POST({cookies}: RequestEvent) {
	cookies.delete("session", {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true}
	)
	return new Response()
}
