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
	discord_username?: string;
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

/**
 * A membership code that can be sent to a user
 * to validate their membership for a given period.
 */
type MembershipCode = {
	id?: number;
	validation_token?: string;
	email: string;
	semesters: Semesters;
	year: number;
	email_sent: Date;
};

type Semesters = 'autumn' | 'spring' | 'all'; // semesters of an academic year
type Id = number;
type DateString = string; //A date stored as string

/**
 * Global settings 
 */
type GlobalSettings = {
	gsheet_id: string,
	gsheet_sync_enabled: boolean,
	code_validity_days: number
}

export type { User, Event, Id, Semesters, DateString, Committee, HonorMember, Book, MembershipCode, GlobalSettings };
