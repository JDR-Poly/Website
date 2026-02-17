/** @format */

enum UserPermission {
	GRANT_ROLE_USER,
	GRANT_ROLE_MEMBER,
	GRANT_ROLE_COMMITTEE,
	GRANT_ROLE_HONORARY_MEMBER,
	CREATE_EVENT,
	SEE_MAIL,
	JOIN_EVENT_USER,
	JOIN_EVENT_MEMBER,
	JOIN_EVENT_COMMITTEE,
	MODIFY_EVENT,
	MODIFY_USERS_DATA,
	ADMIN_PANEL,
	SUBSCRIBE_USER_TO_EVENT,
	REMOVE_USER_FROM_EVENT,
	MODIFY_COMMITTEE_PAGE,
	MODIFY_BOOKS,
	SEE_USERS_PROFILE,
	SEE_USER_DISCORD,
	SETTINGS_PANEL,
	MODIFY_SETTINGS,
}

/**
 * Each user has a role, each role has permissions
 * that can be checked to allow certains actions
 */
class Role {
	readonly name: string;
	readonly permissions = new Set<UserPermission>();

	private constructor(name: string, permissions: UserPermission[] | Set<UserPermission>) {
		this.name = name;
		permissions.forEach((perm) => this.permissions.add(perm));
	}

	//Data for inheritence permission
	static dataInherits: Record<string, Set<UserPermission>> = {};

	/**
	 * Generate a role and append permissions from
	 * any inherited roles (if already created)
	 * @param {string} name name of the role
	 * @param {UserPermission[] | Set<UserPermission>} permissions list of permissions of this role
	 * @param {string[]?} inherits roles' name to inherits permissions from
	 * @returns a new role with all the permissions
	 */
	static createRole(
		name: string,
		permissions: UserPermission[] | Set<UserPermission>,
		inherits?: string[],
	): Role {
		let perms: Set<UserPermission> = new Set(permissions);

		if (inherits) {
			inherits.forEach((inheritedRoleName) => {
				//Get and add permissions of any previously created and inherited role
				let inheritedRole = this.dataInherits[inheritedRoleName];
				if (inheritedRole) {
					inheritedRole.forEach((perm) => perms.add(perm));
				} else {
					console.error("Incorrect role name: " + inheritedRoleName);
				}
			});
		}
		//Save permissions for future inheritance
		this.dataInherits[name] = perms;

		return new Role(name, perms);
	}

	toJSON() {
		return { ...this }; //Allow serialization of this object to json
	}
}

function hasRolePermission(permission: UserPermission | string, role?: Role): boolean {
	if (!role) return false;
	const permissions = Roles[role.name].permissions;
	if (typeof permission === "string") {
		try {
			permission = (UserPermission as any)[permission];
		} catch (exception) {
			return false;
		}
	}
	return permissions.has(permission as UserPermission);
}

function isRoleMember(role?: Role): boolean {
	if (!role) return false;
	return role != Roles.USER;
}

/**
 * List of all existing roles
 */
const Roles: Record<string, Role> = {
	USER: Role.createRole("USER", [UserPermission.JOIN_EVENT_USER]),
	MEMBER: Role.createRole(
		"MEMBER",
		[UserPermission.JOIN_EVENT_MEMBER, UserPermission.SEE_USERS_PROFILE],
		["USER"],
	),
	HONORARY_MEMBER: Role.createRole("HONORARY_MEMBER", [], ["MEMBER"]),
	DISCORD_BOT: Role.createRole("DISCORD_BOT", [
		UserPermission.SEE_USER_DISCORD,
		UserPermission.SEE_USERS_PROFILE,
	]),
	COMMITTEE: Role.createRole(
		"COMMITTEE",
		[
			UserPermission.GRANT_ROLE_MEMBER,
			UserPermission.GRANT_ROLE_USER,
			UserPermission.MODIFY_EVENT,
			UserPermission.MODIFY_USERS_DATA,
			UserPermission.CREATE_EVENT,
			UserPermission.ADMIN_PANEL,
			UserPermission.JOIN_EVENT_COMMITTEE,
			UserPermission.SUBSCRIBE_USER_TO_EVENT,
			UserPermission.REMOVE_USER_FROM_EVENT,
			UserPermission.MODIFY_BOOKS,
			UserPermission.SEE_MAIL,
			UserPermission.SEE_USER_DISCORD,
		],
		["MEMBER"],
	),
	ADMIN: Role.createRole(
		"ADMIN",
		[
			UserPermission.GRANT_ROLE_COMMITTEE,
			UserPermission.GRANT_ROLE_HONORARY_MEMBER,
			UserPermission.MODIFY_COMMITTEE_PAGE,
			UserPermission.SETTINGS_PANEL,
			UserPermission.MODIFY_SETTINGS,
		],
		["COMMITTEE"],
	),
};

export { UserPermission, Role, Roles, hasRolePermission, isRoleMember };
