import type { User } from "src/types";
import { UserPermission, Role, Roles } from "../userPermissions";
import { db } from "./postgresClient";

/**
 * Return true if the user has a permission, else false
 * @param {User} user a user 
 * @param {UserPermission} permission a permission to check 
 * @returns {Promise<boolean>} true if it has the permissions, false otherwise
 */
async function hasPermission(user: User, permission: UserPermission): Promise<boolean> {
    const userData = (await db.any("SELECT id, role FROM ${table:name} WHERE email=$[email]", {
        table: "users",
        email: user.email
    })).pop()

    if(!userData) return false

    const role = Roles[userData["role"]]
    if(!role) return false
    
    return role.permissions.has(permission)
}



export {hasPermission}