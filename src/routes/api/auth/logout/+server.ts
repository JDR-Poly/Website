import type { RequestHandler } from './$types.js'

export const POST = (({ cookies }) => {
	cookies.delete("session", {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true
	}
	)
	return new Response()
}) satisfies RequestHandler
