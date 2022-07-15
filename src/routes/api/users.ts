import type {RequestEvent} from "@sveltejs/kit";
import {db} from "$lib/postgresClient"
import type { User } from "src/types";


/**
 * Search a certain number of user(max 100) where user/mail matches
 * text (with an index)
 * @param {RequestEvent} request  
 * @param {number} request.number how many users to look for (max 100)
 * @param {number} request.index index from which to start returning users from (max 100)
 * @param {string} request.searchText name to look for
 * @return {User?} users found
 */
export async function post({request}: RequestEvent) {
    const body = await request.json()

    const number = () => {
        return Math.min(100, body.number)
    }
    const index = Math.min(100, body.index || 0)
    const searchText = () => {
        if(body.searchText) {
            return "%" + body.searchText + "%"
        } else {
            return "%"
        }
    }

    const res = await db.any(USER_SEARCH, {
        table: "users",
        searchText: searchText,
        number: number,
        index: index
    })
    return {
        status: 200,
        headers: {
            "Content-Type" : "application/json"
        },
        body: {
            users: res
        }
    }
}

const USER_SEARCH = "SELECT id, email, name FROM ${table:name} WHERE name ~~* $[searchText] OR email ~~* $[searchText] LIMIT $[number] OFFSET $[index];"
