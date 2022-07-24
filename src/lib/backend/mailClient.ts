import { createTestAccount, createTransport, type Transporter, getTestMessageUrl } from "nodemailer";
import { v4 as uuid } from "uuid"
import { db } from "./postgresClient";

let transporter: Transporter | undefined
let ethereal = false
if (import.meta.env.PROD) {
	const testTransporter = createTransport({
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT || "465"),
		secure: (process.env.MAIL_PORT === "465" || process.env.MAIL_PORT === undefined),
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
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

async function sendEmail(to: any, subject: string, html: string): Promise<any> {
	try {
		const result = await transporter!.sendMail({
			from: '"JDRPoly Info" <informatique@jdrpoly.ch>',
			to: to,
			subject: subject,
			html: html
		})
		if (ethereal) console.log("Preview Mail: %s", getTestMessageUrl(result));
		return result
	} catch (err) {
		console.log(err)
		return err
	}

}

async function sendEmailValidationToken(userId: number, mail: string, origin: string) {
	const emailValidationToken = uuid()

	await db.none(DB_EMAIL_VALIDATION_TOKEN, {
		table: "email_validation",
		id: userId,
		validation_token: emailValidationToken
	})
	sendEmail(mail, "JDRPoly: Validez votre mail", '<a href="' + origin + '/u/validate-email/' + emailValidationToken + '" target="_blank">Valider</a>')
}

export { sendEmailValidationToken, sendEmail }

const DB_EMAIL_VALIDATION_TOKEN = "INSERT INTO $[table:name](id, validation_token) VALUES($[id],$[validation_token])" +
	"ON CONFLICT (id) DO UPDATE SET validation_token=$[validation_token]"