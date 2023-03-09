import type { Role } from "$lib/userPermissions"

type Event = {
	id: Id
	title: string,
	author: Id,
	category: string,
	date: Date,
	inscription: boolean,
	inscription_group: string,
	inscription_start: Date | undefined,
	inscription_stop: Date | undefined,
	description: string | undefined
}

/**
 * A user with the same key/type
 * of the database
 */
type User = {
	id: Id,
	email?: string,
	name?: string,
	role?: Role,
	is_email_validated?: boolean,
	account_creation?: Date,
	discord_id?: string,
	bio?: string,
	member_start?: Date,
	member_stop?: Date
}

/**
 * A data type only useful for the committee page
 */
type Committee = {
	id: Id,
	category: string,
	title: string,
	name?: string,
	description?: string,
	item_order?: number, //For the order in which to show it on the committee page
}

type Id = number

export type { User, Event, Id, Committee }