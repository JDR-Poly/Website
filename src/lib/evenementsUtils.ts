/** @format */

import { Roles, UserPermission } from "./userPermissions";

//List of hard-coded categories that can be assigned to evenenements
const categories = [
	"GN & Murder",
	"Nocturne, soirée d'initation",
	"Soirée membre",
	"Événement divers",
	"Événement externe",
	"Weekend jeu de rôle",
];

/**
 * Get string of type of roles that can be set
 * as filter for subscribing to an event
 * @returns list of possible group for event filter
 */
function returnJoinEventRoles(): string[] {
	const res = [];
	for (const permission in UserPermission) {
		if (permission.includes("JOIN_EVENT_")) {
			res.push(Roles[permission.split("JOIN_EVENT_")[1]].name);
		}
	}
	return res;
}

export { categories, returnJoinEventRoles };
