import type { Actions } from './$types';;
import { fail } from '@sveltejs/kit';
import { hasRolePermission, UserPermission } from '$lib/userPermissions';
import { db } from '$lib/server/postgresClient';
import { writeFileSync } from 'fs';
import { __envDir } from '$lib/utils';

export const actions = {

	/**
	 * Create a new committee for the committee page
	 * @param {string} request.category the category of the committee (like "2022-2023") 
	 * @param {string?} request.title title of committee 
	 * @param {string?} request.name name of committee
	 * @param {string?} request.description description of committee
	 * @param {Blob?} request.image description of committee 
	 */
	addCommittee: async ({locals, request}) => {
		if (!locals.authenticated) return fail(401, {message: "Not authentified"})
		if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role)) return fail(403, {message: "User doesn't have the permission to do that"})

		const body = await request.formData()
		const category = body.get('category')?.toString()
		if (!category) return fail(400, {message: 'No category found'})
		const image = body.get("image")?.valueOf() as Blob | undefined

		return db.any("SELECT item_order FROM committee_info WHERE category = $1", [category])
			.then((res) => {
				res.push({ item_order: -1 }) //If the array is empty, set the max to -1 so that the new order will be 0
				const maxOrder = Math.max(...res.map((v) => v.item_order))
				
				return db.one(
					`INSERT INTO committee_info
					(category,title,item_order,name,description)
					VALUES ($1,$2,$3,$4,$5) RETURNING id`
					, [category, body.get('title')?.toString(), maxOrder + 1, body.get('name')?.toString(), body.get('description')?.toString()],
					a => a.id
				)
					.then(async (id) => {		
						console.log("oui");
						if(image) {
							const file = await image.arrayBuffer()
							writeFileSync(__envDir + 'data/images/committee/' + id + '.png', Buffer.from(file))
						}
						return { success: true }
					})
			})
			.catch((err) => { 
				console.log(err);
				return fail(500, err.message) })

	}
} satisfies Actions;