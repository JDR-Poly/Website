import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import {handler} from './build/handler.js';

var key = fs.readFileSync('./ssl/privkey.pem');
var cert = fs.readFileSync('./ssl/cert.pem');
var credentials = {
  key: key,
  cert: cert
};

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const SSLPORT = 443;

httpsServer.listen(SSLPORT, function () {
    console.info('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);
