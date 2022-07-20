import { db } from "$lib/backend/postgresClient";
import type { RequestEvent } from "@sveltejs/kit";

export async function post({request}: RequestEvent) {
    const body = await request.json()

    const result = (await db.any("SELECT id FROM $[table:name] WHERE validation_token=$[validation_token]", {
        table: "email_validation",
        validation_token: body.uuid
    })).pop()
    if(!result) return {status: 404}

    db.none("DELETE FROM $[table:name] WHERE id=$[id]", {
        table: "email_validation",
        id: result.id
    })

    await db.none("UPDATE $[table:name] SET is_email_validated=TRUE WHERE id=$[id]", {
        table: "users",
        id: result.id
    })
    return {status: 200}
}