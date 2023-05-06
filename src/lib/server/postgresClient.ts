import pgPromise from 'pg-promise';
import { env } from '$env/dynamic/private';

const pgp = pgPromise()

const db = pgp({
	host: env.DB_IP,
	port: parseInt(env.DB_PORT || '5432'),
	database: env.DB_NAME,
	user:  env.DB_USER,
	password: env.DB_PASSWORD,
	max: 50
});

export { db }