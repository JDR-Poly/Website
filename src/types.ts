
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
    email: string,
    name?: string,
    accountCreation?: Date,
    discordId?: string | undefined,
    avatarId?: string | undefined,
    bioText?: string | undefined,
    memberStart?: Date | undefined,
    memberStop?: Date | undefined
}

export type {User, Event}