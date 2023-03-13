import { createTestAccount, createTransport, type Transporter, getTestMessageUrl } from "nodemailer";
import type { Id } from "$gtypes";
import { v4 as uuid } from "uuid"
import { db } from "./postgresClient";
import { readFile, readdir } from 'fs';
import { MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_USER } from '$env/static/private';
import { __envDir } from "$lib/utils";


let transporter: Transporter | undefined
let ethereal = false
if (import.meta.env.PROD) {
	const testTransporter = createTransport({
		host: MAIL_HOST,
		port: parseInt(MAIL_PORT || "465"),
		secure: (MAIL_PORT === "465" || MAIL_PORT === undefined),
		auth: {
			user: MAIL_USER,
			pass: MAIL_PASSWORD
		}
	});
	testTransporter.verify((error, success) => {
		if (!error) {
			transporter = testTransporter
			console.log("Email transporter is correctly linked")
		} else {
			console.log(error)
		}
	});
}
if (transporter == undefined) {
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
}

async function sendMail(to: any, subject: string, html: string): Promise<any> {	
	try {
		const result = await transporter!.sendMail({
			from: '"JDRPoly Info" <informatique@jdrpoly.ch>',
			to: to,
			subject: subject,
			html: html
		})
		if (ethereal) console.log("Preview Mail: %s", getTestMessageUrl(result));
		return result
	} catch (err: any) {		
		return Error(err.message)
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

export { sendMailValidationToken, sendMail }

const DB_EMAIL_VALIDATION_TOKEN = "INSERT INTO $[table:name](id, validation_token) VALUES($[id],$[validation_token])" +
	"ON CONFLICT (id) DO UPDATE SET validation_token=$[validation_token]"