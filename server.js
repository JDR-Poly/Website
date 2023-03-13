import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import {handler} from './build/handler.js';

var key = fs.readFileSync('/etc/letsencrypt/live/jdrpoly.ch/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/jdrpoly.ch/cert.pem');
var credentials = {
  key: key,
  cert: cert
};

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const PORT = 80;
const SSLPORT = 443;

httpsServer.listen(SSLPORT, function () {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
    res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);
