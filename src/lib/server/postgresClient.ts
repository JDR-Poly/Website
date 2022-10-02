import pgPromise from 'pg-promise';
const pgp = pgPromise()

const db = pgp({
	host: process.env.DB_IP,
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	max: 50
});

export { db }