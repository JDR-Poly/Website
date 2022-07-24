import pgPromise from 'pg-promise';
import type { IDatabase } from "pg-promise";
import type { IClient } from "pg-promise/typescript/pg-subset";
const pgp = pgPromise()

const db = pgp({
	host: process.env.DB_IP,
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	max: 50
});

const CREATE_USER_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
	"id SERIAL PRIMARY KEY," +
	"email VARCHAR(255) NOT NULL," +
	"is_email_validated BOOLEAN NOT NULL," +
	"name VARCHAR(255) NOT NULL," +
	"password VARCHAR(255) NOT NULL," +
	"role VARCHAR(255) NOT NULL," +
	"account_creation DATE NOT NULL DEFAULT CURRENT_DATE," +
	"discord_id VARCHAR(255)," +
	"avatar_id VARCHAR(50)," +
	"bio TEXT," +
	"member_start DATE," +
	"member_stop DATE" +
	")"

const CREATE_COOKIE_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
	"email VARCHAR(255) PRIMARY KEY NOT NULL," +
	"cookieId VARCHAR(255) NOT NULL" +
	")"

const CREATE_EMAIL_VALIDATION_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
	"id INT PRIMARY KEY NOT NULL," +
	"validation_token VARCHAR(255) NOT NULL" +
	")"
const CREATE_MEMBER_CODE_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
	"validation_token VARCHAR(255) PRIMARY KEY NOT NULL," +
	"periods INT NOT NULL," +
	"code_creation DATE NOT NULL DEFAULT CURRENT_DATE" +
	")"

async function init(db: IDatabase<unknown, IClient>) {
	await db.none(CREATE_USER_TABLE, {
		table: "users"
	})
	await db.none(CREATE_COOKIE_TABLE, {
		table: "cookies"
	})
	await db.none(CREATE_EMAIL_VALIDATION_TABLE, {
		table: "email_validation"
	})
	await db.none(CREATE_MEMBER_CODE_TABLE, {
		table: "members_code"
	})
}

await init(db)
export { db }