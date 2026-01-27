/** @format */

import pgPromise from "pg-promise";
import { env } from "$env/dynamic/private";
import { schedule } from "node-cron";
import { logger } from "./logger";
import { building } from "$app/environment";

const pgp = pgPromise();

//The !building trick prevent call to env ($env/dynamic/private) while doing prerendering, thus preventing a crash.
const creditentials = !building
	? {
			host: env.DB_IP,
			port: parseInt(env.DB_PORT || "5432"),
			database: env.DB_NAME,
			user: env.DB_USER,
			password: env.DB_PASSWORD,
			max: 50,
		}
	: {
			host: "127.0.0.1",
			port: 5432,
			database: "jdrpoly",
			user: "jdrpoly",
			password: "password",
			max: 50,
		};
const db = pgp(creditentials);

/**
 * Regularly delete expired data from database
 */
schedule("0 1 * * *", () => {
	db.none(
		`UPDATE users SET role='USER', member_start=NULL, member_stop=NULL WHERE NOW() >= member_stop AND role='MEMBER'`,
	);
	db.none(
		`UPDATE users SET role='MEMBER' WHERE NOW() >= member_start AND NOW() < member_stop AND role='USER'`,
	);
	db.none(`DELETE FROM email_validation e USING users u WHERE e.user_id = u.id AND u.is_email_validated`);
	db.none(`DELETE FROM sessions WHERE NOW() > expiration_date`);
	logger.info(`Cleaned database for expired data at ${new Date(Date.now()).toLocaleDateString()}`);
});

export { db };
