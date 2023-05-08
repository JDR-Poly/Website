import pgPromise from 'pg-promise';
import { env } from '$env/dynamic/private';
import { schedule } from 'node-cron'

const pgp = pgPromise()

const db = pgp({
	host: env.DB_IP,
	port: parseInt(env.DB_PORT || '5432'),
	database: env.DB_NAME,
	user:  env.DB_USER,
	password: env.DB_PASSWORD,
	max: 50
});

schedule('0 1 * * *', () => {
	db.none(`UPDATE users SET role='USER', member_start=NULL, member_stop=NULL WHERE NOW() >= member_stop AND role='MEMBER'`)
	db.none(`DELETE FROM email_validation e USING users u WHERE e.id = u.id AND u.is_email_validated`)
	db.none(`DELETE FROM sessions WHERE NOW() > expiration_date`)
});

export { db }