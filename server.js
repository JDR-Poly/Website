/** @format */

import "dotenv/config";
import express from "express";
import fs from "fs";
import https from "https";
import http from "http";
import { handler } from "./build/handler.js";
import { umzug } from "./migrator.js";

let isHttp = false;
process.argv.slice(2).forEach(function (val, index, array) {
	if (val === "--http" && val !== "--https") {
		isHttp = true;
	}
});

//Mount umzug database
(async () => {
	await umzug.up();
})();

//Launch express server
const app = express();
if (isHttp) {
	const HTTP_PORT = 80;
	const httpServer = http.createServer(app);
	httpServer.listen(HTTP_PORT, function () {
		console.info("HTTP Server is running on: http://localhost:%s", HTTP_PORT);
	});
} else {
	//SSL credentials
	var key = fs.readFileSync("./ssl/privkey.pem");
	var cert = fs.readFileSync("./ssl/cert.pem");
	var credentials = {
		key: key,
		cert: cert,
	};

	const httpsServer = https.createServer(credentials, app);

	const SSLPORT = 443;
	httpsServer.listen(SSLPORT, function () {
		console.info("HTTPS Server is running on: https://localhost:%s", SSLPORT);
	});
}

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);
