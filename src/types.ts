import type { Role } from "$lib/userPermissions"

type Event = {
	id: Id
	title: string,
	description: string,
	author: Id,
	category: string,
	date: Date,
	inscription: boolean,
	inscription_group: string,
	inscription_start?: Date,
	inscription_stop?: Date,
	imageb64?: string
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
	account_creation?: string, //Date
	discord_id?: string,
	bio?: string,
	member_start?: string, //Date
	member_stop?: string //Date
}

/**
 * A data type only useful for the committee page
 */
type Committee = {
	id: Id,
	category: string,
	title: string,
	name?: string,
	imageb64?: string,
	description?: string,
	item_order?: number, //For the order in which to show it on the committee page
}

/**
 * A data type only useful for the /docs/ page to show honor members
 */
type HonorMember = {
	id: Id,
	name: string,
	item_order: number, //For the order in which to show it on the /docs/ page
	description?: string
}

type Book = {
	id: Id,
	title: string,
	item_order: number,
	caution?: number,
	status?: string
}

type Id = number

export type { User, Event, Id, Committee, HonorMember, Book }