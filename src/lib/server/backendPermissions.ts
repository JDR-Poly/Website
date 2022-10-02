import type { User } from "src/types";
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

function hasRolePermission(role: Role, permission: UserPermission | string): boolean {
	if (typeof permission === "string") {
		permission = (UserPermission as any)[permission]
	}
	return role.permissions.has((permission as UserPermission))
}

/**
 * Check if the user is authicated and has the correct permission and
 * return correct status code if there is a problem or return false
 * @param locals locals of a request 
 * @param permission a permission to check
 * @return a status code if the permission is missing, otherwise false
 */
function isLocalsMissingPermission(locals: App.Locals, permission: UserPermission): any {
	if (!locals.authenticated) return {
		status: 401,
		body: {
			message: "User is not authenticated"
		}
	}
	if (!hasRolePermission(locals.user?.role!, permission)) {
		return {
			status: 403,
			body: {
				message: "User doesn't have the permission to do that"
			}
		}
	}
	return false
}

export { getUserRole, hasRolePermission, isLocalsMissingPermission }