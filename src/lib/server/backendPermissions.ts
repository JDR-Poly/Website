import type { User } from "$gtypes";
import { Role, Roles, UserPermission } from "../userPermissions";
import { db } from "./postgresClient";

/**
 * Return the user role if found
 * @param {User} user a user 
 * @returns {Promise<boolean>} user's role if found, undefined otherwise
 */
async function getUserRole(user: User): Promise<Role | undefined> {
	const userData = (await db.any("SELECT id, role FROM ${table:name} WHERE id=$[id]", {
		table: "users",
		id: user.id
	})).pop()

	if (!userData) return

	const role = Roles[userData["role"]]
	if (!role) return

	return role
}

export { getUserRole }