import { env } from "$env/dynamic/private";

interface TokenValidateResponse {
	'error-codes': string[];
	success: boolean;
	action: string;
	cdata: string;
}

interface ChallengeResponse {
	success: boolean,
	error: string | null
}

/**
 * Verify token of cloudflare challenge
 * @param token cloudflare token
 * @param fetch fetch function of sveltekit to use
 * @returns the challenge result
 */
async function validateToken(token: string, fetch: any): Promise<ChallengeResponse> {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			response: token,
			secret: env.TURNSTILE_SECRET!
		})
	});

	const data: TokenValidateResponse = await response.json();

	return {
		success: data.success,

		// Return the first error if it exists
		error: data['error-codes']?.length ? data['error-codes'][0] : null
	};
}

export {validateToken}