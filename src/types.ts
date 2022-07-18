import type { Role } from "$lib/userPermissions"

type Event = {
    name: string,
    author: string | undefined,
    date: Date,
    inscriptionStart: Date,
    inscriptionStop: Date | undefined,
    subscribed: Array<string>
}

type User = {
    id: number,
    email?: string,
    name?: string,
    role?: Role,
    accountCreation?: Date,
    discordId?: string,
    avatarId?: string,
    bioText?: string,
    memberStart?: Date,
    memberStop?: Date
}

export type {User, Event}