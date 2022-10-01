import type { RequestEvent } from "@sveltejs/kit";
import { serialize } from "cookie";

export async function post() {
	const headers = {
		"Set-Cookie": serialize(
			"session_id",
			'',
			{
				expires: new Date(Date.now() - 3600),
				path: "/",
				httpOnly: true,
				secure: true,
				sameSite: "strict"
			}
		)
	}

	return {
		status: 200,
		headers,
		body: {
			message: "Successfully logged out"
		}
	}
}