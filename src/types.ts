/** @format */

import type { Role } from "$lib/userPermissions";

/**
 * An event is a schelduled soiree
 * that can optionally be joined.
 */
type Event = {
	id: Id;
	author: Id;
	title: string;
	category: string;
	date: DateString;
	description: string;
	inscription: boolean;
	inscription_group: string;
	inscription_limit?: number;
	inscription_start?: DateString;
	inscription_stop?: DateString;
	imageb64?: string;
};

/**
 * A user with the same key/type
 * of the database.
 * A string is used instead of a Role object for storing
 * the role since sending/receiving data on front-end doesn't allow sending
 * objects. 
 */
type User = {
	id: Id;
	name: string;
	role: Role;
	is_email_validated: boolean;
	account_creation: DateString;
	email?: string;
	discord_id?: string;
	member_start?: DateString;
	member_stop?: DateString;
};

/**
 * A data type only useful for the committee page
 */
type Committee = {
	id: Id;
	category: string;
	title: string;
	name?: string;
	imageb64?: string;
	description?: string;
	item_order: number; //For the order in which to show it on the committee page
};

/**
 * A data type only useful for the /docs/ page to show honor members
 */
type HonorMember = {
	id: Id;
	name: string;
	item_order: number; //For the order in which to show it on the /docs/ page
	description?: string;
};

type Book = {
	id: Id;
	title: string;
	item_order: number;
	caution?: number;
	status?: string;
};

type Id = number;
type DateString = string; //A date stored as string

export type { User, Event, Id, DateString, Committee, HonorMember, Book };
