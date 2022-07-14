import cookie from "cookie"
import {db} from "$lib/postgresClient"
import type { GetSession, Handle } from "@sveltejs/kit"

export const handle:Handle = async function({event, resolve}) {
    const cookies = cookie.parse(event.request.headers.get('cookie') || "")
    event.locals.authenticated = false
    if(!cookies.session_id) {
        return resolve(event);
    }

    const email = (await db.any("SELECT email FROM ${table:name} WHERE cookieId=$[cookieId]", {
        table: "cookies",
        cookieId: cookies.session_id
    })).pop()
    if(email) {
        const user = (await db.any("SELECT id, email FROM ${table:name} WHERE email=$[email]", {
            table: "users",
            email: email.email
        })).pop()
        event.locals = {
            authenticated: true,
            email: user.email,
            profileId: user.id
        }
    } 
    return resolve(event);

}

export const getSession: GetSession = async function(event) {
    if(!event.locals.authenticated) {
        return {
            authenticated: false
        }
    } else {
        return {
            authenticated: true,
            email: event.locals.email,
            profileId: event.locals.profileId
        }
    }
}