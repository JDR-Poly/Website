import type { LoadEvent, LoadOutput } from "@sveltejs/kit";

/**
 * At module load, redirect user if he is not authenticated
 * @param {LoadEvent} event the module load event
 * @param {string} redirection where to redirect to
 * @returns {LoadOutput} a load response
 */
function redirectIfNotAuthenticated(event: LoadEvent, redirection: string): LoadOutput {
	if(!event.session.authenticated) {
		return {
			status: 302, //Status 302 automatically redirect
			redirect: redirection
		}
	} else if(event.session.authenticated && !event.session.user?.is_email_validated) {
		return {
			status: 302, //Status 302 automatically redirect
			redirect: "/u/validate-email"
		}
	} else {
		return { status: 200 }
	}
}

/**
 * At module load, redirect user if he is authenticated
 * @param {LoadEvent} event the module load event
 * @param {string} redirection where to redirect to
 * @returns {LoadOutput} a load response
 */
function redirectIfAuthenticated(event: LoadEvent, redirection: string): LoadOutput {
	if(event.session.authenticated && event.session.user?.is_email_validated) {
		return {
			status: 302, //Status 302 automatically redirect
			redirect: redirection
		}
	} else if(event.session.authenticated && !event.session.user?.is_email_validated) {
		return {
			status: 302, //Status 302 automatically redirect
			redirect: "/u/validate-email"
		}
	} else {
		return { status: 200 }
	}
}

export {redirectIfNotAuthenticated, redirectIfAuthenticated}