import { createTestAccount, createTransport, type Transporter, getTestMessageUrl } from "nodemailer";
import type { Id } from "$gtypes";
import { v4 as uuid } from "uuid"
import { db } from "./postgresClient";
import { readFile } from 'fs';
import { env } from '$env/dynamic/private';
import { __envDir } from "$lib/utils";
import { logger } from "./logger";

let transporter: Transporter | undefined
let ethereal = false

async function preloadTransporter() {
	if (import.meta.env.PROD) {
		const testTransporter = createTransport({
			host: env.MAIL_HOST,
			port: parseInt(env.MAIL_PORT || "465"),
			secure: (env.MAIL_PORT === "465" || env.MAIL_PORT === undefined),
			auth: {
				user: env.MAIL_USER,
				pass: env.MAIL_PASSWORD
			}
		});
		testTransporter.verify(async (error, success) => {
			if (!error) {
				transporter = testTransporter
				logger.info("Email transporter is correctly linked")
			} else {
				logger.error(error)
				transporter = await generateEtheralTransporter()
			}
		});
	} else {
		if (transporter == undefined) {
			transporter = await generateEtheralTransporter()
			logger.info("Etheral email transporter is correctly linked")
		}
	}
}

async function sendMail(to: string, subject: string, html: string): Promise<any> {	
	try {
		const result = await transporter!.sendMail({
			from: '"JDRPoly Info" <informatique@jdrpoly.ch>',
			to: to,
			subject: subject,
			html: html
		})
		if (ethereal) logger.info(`Preview Mail: ${getTestMessageUrl(result)}`);
		else { logger.info(`Mail ${subject} to ${to}`)}
		return result
	} catch (err: any) {
		logger.error(err);
		return new Error(err.message)
	}
}

async function sendMailValidationToken(userId: Id, mail: string, origin: string) {
	const emailValidationToken = uuid()

	await db.none(DB_EMAIL_VALIDATION_TOKEN, {
		table: "email_validation",
		id: userId,
		validation_token: emailValidationToken
	})
	readFile(__envDir + 'mails/mailValidationToken.html', function(err, data) {
		let html = data.toString()
		html = html.replace('%ORIGIN%', origin)
		html = html.replace('%TOKEN%', emailValidationToken)
		sendMail(mail, "JDRPoly: Validez votre mail", html)
	})
	
}

async function generateEtheralTransporter(): Promise<Transporter> {
	let testAccount = await createTestAccount(); //Generate email using ethereal
	transporter = createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass // generated ethereal password
		}
	});
	ethereal = true
	return transporter
}

export { sendMailValidationToken, sendMail, preloadTransporter }

const DB_EMAIL_VALIDATION_TOKEN = "INSERT INTO $[table:name](id, validation_token) VALUES($[id],$[validation_token])" +
	"ON CONFLICT (id) DO UPDATE SET validation_token=$[validation_token]"