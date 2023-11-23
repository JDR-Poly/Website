import 'dotenv/config'
import express from 'express';
import fs from 'fs';
import https from 'https';
import {handler} from './build/handler.js';
import {umzug} from './migrator.js'

//Mount umzug database
(async () => { await umzug.up();})();

//SSL credentials
var key = fs.readFileSync('./ssl/privkey.pem');
var cert = fs.readFileSync('./ssl/cert.pem');
var credentials = {
  key: key,
  cert: cert
};

//Launch express server
const app = express();
const httpsServer = https.createServer(credentials, app);

const SSLPORT = 443;
httpsServer.listen(SSLPORT, function () {
    console.info('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);
