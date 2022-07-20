import { sendEmailValidationToken } from "$lib/backend/mailClient"
import { db } from "$lib/backend/postgresClient"
import type { RequestEvent } from "@sveltejs/kit"

export async function post({request, url}: RequestEvent) {
    const body = await request.json()

    const result = (await db.any("SELECT id, email FROM $[table:name] WHERE is_email_validated=FALSE", {
        table: "users",
        id: body.id
    })).pop()
    if(!result) return {status: 404}

    sendEmailValidationToken(result.id, result.email, url.origin)
    
    return {status: 200}
}