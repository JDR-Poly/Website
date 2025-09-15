/**
 * Umzug system for automatic migration (mount/unmount)
 * of database
 * Use `npm run migration` to use it manually
 *
 * @format
 */

import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import fs from "fs";
import esMain from "es-main";

const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.DB_IP,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT || "5432"),
	database: process.env.DB_NAME,
	logging: false,
});

const umzug = new Umzug({
	migrations: {
		glob: "migrations/*.up.sql",
		resolve: ({ name, path, context: sequelize }) => ({
			name,
			up: async () => {
				if (path) {
					const sql = fs.readFileSync(path).toString();
					return sequelize.query(sql);
				}
			},
			down: async () => {
				if (path) {
					// Get the corresponding `.down.sql` file to undo this migration
					const sql = fs.readFileSync(path.replace(".up.sql", ".down.sql")).toString();
					return sequelize.query(sql);
				}
			},
		}),
	},
	context: sequelize,
	storage: new SequelizeStorage({ sequelize }),
	logger: console,
});

if (esMain(import.meta)) {
	umzug.runAsCLI();
}

export { umzug };
