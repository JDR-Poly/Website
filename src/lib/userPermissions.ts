enum UserPermission {
	GRANT_ROLE_USER,
	GRANT_ROLE_MEMBER,
	GRANT_ROLE_COMMITTEE,
	GRANT_ROLE_HONORARY_MEMBER,
	CREATE_EVENT,
	JOIN_EVENT_USER,
	JOIN_EVENT_MEMBER,
	JOIN_EVENT_COMMITTEE,
	MODIFY_EVENT,
	MODIFY_USERS_DATA,
	ADMIN_PANEL
}

/**
 * Each user has a role, each role has permissions
 * that can be checked to allow certains actions
 */
class Role {
	readonly name: string;
	readonly permissions = new Set<UserPermission>()

	private constructor(name: string, permissions: UserPermission[] | Set<UserPermission>) {
		this.name = name
		permissions.forEach(perm => this.permissions.add(perm));
	}


	//Data for inheritence permission
	static dataInherits: Record<string, Set<UserPermission>> = {}

	/**
	 * Generate a role and append permissions from
	 * any inherited roles (if already created)
	 * @param {string} name name of the role
	 * @param {UserPermission[] | Set<UserPermission>} permissions list of permissions of this role
	 * @param {string[]?} inherits roles' name to inherits permissions from
	 * @returns a new role with all the permissions
	 */
	static createRole(name: string, permissions: UserPermission[] | Set<UserPermission>, inherits?: string[]): Role {
		let perms: Set<UserPermission> = new Set(permissions);

		if (inherits) {
			inherits.forEach(inheritedRoleName => {
				//Get and add permissions of any previously created and inherited role
				let inheritedRole = this.dataInherits[inheritedRoleName]
				if (inheritedRole) {
					inheritedRole.forEach(perm => perms.add(perm));
				} else {
					console.error("Incorrect role name: " + inheritedRoleName)
				}
			})
		}
		//Save permissions for future inheritance
		this.dataInherits[name] = perms

		return new Role(name, perms)
	}

	toJSON() {
		return { ...this } //Allow serialization of this object to json
	}
}


function hasRolePermission(permission: UserPermission | string, role?: Role, ): boolean {
	if(!role) return false
	if (typeof permission === "string") {
		permission = (UserPermission as any)[permission]
	}
	return role.permissions.has((permission as UserPermission))
}

/**
 * List of all existing roles 
 */
const Roles: Record<string, Role> = {
	USER: Role.createRole("USER", [UserPermission.JOIN_EVENT_USER]),
	MEMBER: Role.createRole("MEMBER", [UserPermission.JOIN_EVENT_MEMBER], ["USER"]),
	HONORARY_MEMBER: Role.createRole("HONORARY_MEMBER", [], ["MEMBER"]),
	COMMITTEE: Role.createRole("COMMITTEE", [UserPermission.GRANT_ROLE_MEMBER, UserPermission.GRANT_ROLE_USER, UserPermission.MODIFY_EVENT, UserPermission.MODIFY_USERS_DATA, UserPermission.CREATE_EVENT, UserPermission.ADMIN_PANEL, UserPermission.JOIN_EVENT_COMMITTEE], ["MEMBER"]),
	ADMIN: Role.createRole("ADMIN", [UserPermission.GRANT_ROLE_COMMITTEE, UserPermission.GRANT_ROLE_HONORARY_MEMBER], ["COMMITTEE"])
}



export { UserPermission, Role, Roles, hasRolePermission}