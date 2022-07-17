import type {RequestEvent} from "@sveltejs/kit";
import {db} from "$lib/backend/postgresClient"
import type { User } from "src/types";


/**
 * Get data of an user from its id
 * @param {RequestEvent} request  
 * @param {number} request.id id of the user
 * @return {User?} user with every data if found
 */
 export async function post({request}: RequestEvent) {
    const body = await request.json()

    let res = (await db.any(USER_GET, {
        table: "users",
        id: body.id
    })).pop()
    if(res) {
        return {
            status: 200,
            headers: {
                "Content-Type" : "application/json"
            },
            body: {
                user: res
            }
        }
    } else {
        return {
            status: 404
        }
    }
    
}

const USER_GET = "SELECT id, email, name, account_creation, discordId, avatarId, bioText, memberStart, memberStop FROM ${table:name} WHERE id=$[id];"