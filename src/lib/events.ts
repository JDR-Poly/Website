import { UserPermission } from "./userPermissions"

const categories = ['GN & Murder', 'Nocturne, soirée d\'initation', 'Soirée membre', 'Événement divers', 'Événement externe', 'Weekend jeu de rôle']


function returnJoinEventRoles(): string[] {
	let res = []
	for(let permission in UserPermission) {
		if(permission.includes("JOIN_EVENT_")) {
			res.push(permission.split("JOIN_EVENT_")[1])
		}
	}
	return res
}

export {categories, returnJoinEventRoles}