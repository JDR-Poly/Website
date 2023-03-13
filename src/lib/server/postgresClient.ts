import pgPromise from 'pg-promise';
import { DB_IP, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from '$env/static/private';

const pgp = pgPromise()

const db = pgp({
	host: DB_IP,
	port: parseInt(DB_PORT || '5432'),
	database: DB_NAME,
	user:  DB_USER,
	password: DB_PASSWORD,
	max: 50
});

export { db }