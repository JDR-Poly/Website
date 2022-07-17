import type { LoadEvent, LoadOutput } from "@sveltejs/kit";

function redirectIfNotAuthenticated(event: LoadEvent, redirection: string): LoadOutput {
    if(!event.session.authenticated) {
        return {
            status: 302,
            redirect: redirection
        }
    } else {
        return { status: 200 }
    }
}

function redirectIfAuthenticated(event: LoadEvent, redirection: string): LoadOutput {
    if(event.session.authenticated) {
        return {
            status: 302,
            redirect: redirection
        }
    } else {
        return { status: 200 }
    }
}

export {redirectIfNotAuthenticated, redirectIfAuthenticated}