/** @format */

import { format, createLogger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { preloadTransporter } from "./mailClient";

const { combine, timestamp, align, colorize, printf, errors } = format;

const logger = createLogger({
	level: import.meta.env.PROD ? "info" : "debug",
	format: combine(
		errors({ stack: true }),
		colorize({ all: true }),
		timestamp({
			format: "YYYY-MM-DD hh:mm:ss A",
		}),
		align(),
		printf((info) => {
			const text = `[${info.timestamp}][${info.level}]: ${info.message}`;
			return info.stack ? text + "\n" + info.stack : text;
		}),
	),
	transports: [
		new transports.Console(),
		new DailyRotateFile({
			filename: "logs/%DATE%-all.log",
			datePattern: "YYYY-w",
			maxFiles: "4w",
		}),
		new DailyRotateFile({
			filename: "logs/%DATE%-error.log",
			datePattern: "YYYY-w",
			maxFiles: "4w",
			level: "error",
		}),
	],
});

logger.info(`Started at ${new Date(Date.now()).toISOString()}`);
preloadTransporter();

export { logger };
