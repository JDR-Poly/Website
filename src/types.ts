import type { Role } from "$lib/userPermissions"

type Event = {
	id: Id
	title: string,
	author: Id,
	date: Date,
	inscription: boolean,
	inscription_group: string,
	inscription_start: Date | undefined,
	inscription_stop: Date | undefined,
	description_text: string | undefined
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
	avatar_id?: string,
	bio?: string,
	member_start?: Date,
	member_stop?: Date
}

type Id = number

export type { User, Event, Id }