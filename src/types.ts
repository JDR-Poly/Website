import type { Role } from "$lib/userPermissions"

type Event = {
	id: Id
	author: Id,
	title: string,
	category: string,
	date: UTCStringDate,
	description: string,
	inscription: boolean,
	inscription_group: string,
	inscription_limit?: number,
	inscription_start?: UTCStringDate,
	inscription_stop?: UTCStringDate,
	imageb64?: string
}

/**
 * A user with the same key/type
 * of the database
 */
type User = {
	id: Id,
	name: string,
	role: Role,
	is_email_validated: boolean,
	account_creation: UTCStringDate,
	email?: string,
	discord_id?: string,
	member_start?: UTCStringDate,
	member_stop?: UTCStringDate
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
	item_order: number, //For the order in which to show it on the committee page
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
type UTCStringDate = string

export type { User, Event, Id, UTCStringDate, Committee, HonorMember, Book }