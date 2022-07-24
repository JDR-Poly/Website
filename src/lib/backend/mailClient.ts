import { createTestAccount, createTransport, type Transporter, getTestMessageUrl } from "nodemailer";
import { v4 as uuid } from "uuid"
import { db } from "./postgresClient";


let transporter: Transporter
if (import.meta.env.DEV) {
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
} else {
	transporter = createTransport({
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT || "465"),
		secure: (process.env.MAIL_PORT === "465" || process.env.MAIL_PORT === undefined),
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD
		}
	});
}

async function sendEmailValidationToken(userId: number, mail: string, origin: string) {
	const emailValidationToken = uuid()

	await db.none(DB_EMAIL_VALIDATION_TOKEN, {
		table: "email_validation",
		id: userId,
		validation_token: emailValidationToken
	})
	try {
		const result = await transporter.sendMail({
			from: '"JDRPoly Info" <informatique@jdrpoly.ch>',
			to: mail,
			subject: "JDRPoly: Validez votre mail", // Subject line
			html: '<a href="' + origin + '/u/validate-email/' + emailValidationToken + '" target="_blank">Hello world?</a>'
		})
		if (import.meta.env.DEV) console.log("Preview Mail: %s", getTestMessageUrl(result));
	} catch (err) {
		console.error(err)
	}


}

export { sendEmailValidationToken, transporter }

const DB_EMAIL_VALIDATION_TOKEN = "INSERT INTO $[table:name](id, validation_token) VALUES($[id],$[validation_token])" +
	"ON CONFLICT (id) DO UPDATE SET validation_token=$[validation_token]"