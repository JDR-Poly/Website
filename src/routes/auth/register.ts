import {db} from "$lib/backend/postgresClient"
import type {RequestEvent} from "@sveltejs/kit";
import {hash} from "bcrypt"
import {v4 as uuid} from "uuid"
import cookie from "cookie"

export async function post({request}: RequestEvent) {
    const body = await request.json()
    const user = await db.any("SELECT 'email' FROM ${table:name} WHERE email=$[email]", {
        table: "users",
        email: body.email
    })
    if(user.pop() != undefined) {
        return {
            status: 409,
            body: {
                message: "Un utilisateur avec cet email existe déjà."
            }
        }
    } else {
        if(!validateEmail(body.email)
            || !validateName(body.name)
            || !validatePassword(body.password)) {
                return {
                    status: 406,
                    body : {
                        message: "Data format invalid"
                    }
                }
        }
        const returnData = await db.any(DB_USER_UPLOAD, {
            table: "users",
            email: body.email,
            name: body.name,
            password: await hash(body.password, 10),
            role: "USER"
        })
        const profileId = returnData.pop()
        if(profileId == undefined) {
            return {
                status: 406,
                body : {
                    message: "Database unreachable"
                }
            }
        }

        const cookieId = uuid()
        await db.none(DB_COOKIE_UPLOAD, {
            table: "cookies",
            email: body.email,
            cookieId: cookieId
        })

        const headers = {
            "Set-Cookie": cookie.serialize("session_id", cookieId, {
                httpOnly: true,
                secure: true,
                maxAge: 60*60*24*7,
                sameSite: "strict",
                path: "/"
            })
        }
        return {
            status: 200,
            headers,
            body: {
                message: "Success: account created",
                profileId: profileId.id
            }
        }

    }

}

function validateEmail(str?: string): boolean {
    return true
}

function validateName(str?: string): boolean {
    return true
}
function validatePassword(str?: string): boolean {
    return true
}

const DB_USER_UPLOAD = "INSERT INTO $[table:name](email, name, password, role, is_email_validated) VALUES" +
    "($[email],$[name],$[password],$[role], FALSE) RETURNING id"
const DB_COOKIE_UPLOAD = "INSERT INTO $[table:name](email, cookieId) VALUES($[email],$[cookieId])"