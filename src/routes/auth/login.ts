import {db} from "../../lib/postgresClient";
import type {RequestEvent} from "@sveltejs/kit";
import {compare} from "bcrypt";
import {v4 as uuid} from "uuid";
import cookie from "cookie";


export async function post({request}: RequestEvent) {
    const body = await request.json()
    const user = (await db.any("SELECT id, email, password FROM ${table:name} WHERE email=$[email]", {
        table: "users",
        email: body.email
    })).pop()
    if(user == undefined || !await compare(body.password, user.password)) {
        return {
            status: 401,
            body: {
                message: "Incorrect mail or password."
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
            message: "Success: loggin into account",
            profileId: user.id
        }
    }
}

const DB_COOKIE_UPLOAD = "INSERT INTO $[table:name](email, cookieId) VALUES($[email],$[cookieId])" +
    "ON CONFLICT (email) DO UPDATE SET cookieId=$[cookieId]"