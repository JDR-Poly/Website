import type { Role } from "$lib/userPermissions"

type Event = {
	name: string,
	author: string | undefined,
	date: Date,
	inscriptionStart: Date,
	inscriptionStop: Date | undefined,
	subscribed: Array<Id>
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