#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';
import https from 'https';
import { WebSocketServer } from 'ws'; // version 8.18.0
import { WSProxy } from './modules/WSProxy.js';
import { onEntryRequest } from './routes/onEntryRequest.js';
import config from '../config.js';

// paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ROOT = path.resolve(__dirname, '../');

// SSL/HTTPS certificates
let serverOptions;
if (config.useSSL) {
    try {
        serverOptions = {
            key: fs.readFileSync(path.join(DIR_ROOT, config.sslKey)),
            cert: fs.readFileSync(path.join(DIR_ROOT, config.sslCert))
        };
    } catch (err) {
        console.log("No SSL/HTTPS certificates found.");
    }
}

export function server() {
    let httpServer, httpsServer;

    // create HTTP & HTTPS servers
    httpServer = http.createServer();
    if (config.useSSL) {
        httpsServer = https.createServer(serverOptions);
    }

    // force all HTTP requests to be redirected to HTTPS
    if (config.useSSL) {
        httpServer.on('request', (req, res) => {
            res.writeHead(301, { 'Location': 'https://' + (req.headers.host || config.host) + req.url });
            res.end();
        });
    }

    // setup routing
    httpServer.on('request', onEntryRequest);
    if (config.useSSL) {
        httpsServer.on('request', onEntryRequest);
    }

    // start ws server
    // bind it to our HTTPS server.
    // if NOT, use the host/port options.
    const wss = new WebSocketServer({
        server: config.useSSL ? httpsServer : httpServer, // bind to HTTPS server instance.
        // host: '127.0.0.1', // {String} The hostname where to bind the server.
        // port: 5999, // {Number} The port number on which to listen.
        clientTracking: false, // {Boolean} Specifies whether or not to track clients.
        // maxPayload: 104857600, // {Number} The maximum allowed message size in bytes. Defaults to 100 MiB (104857600 bytes).
        skipUTF8Validation: false, // {Boolean} Specifies whether or not to skip UTF-8 validation for text and close messages. Defaults to false. Set to true only if clients are trusted.
        perMessageDeflate: false, // {Boolean|Object} Enable/disable permessage-deflate.
    });

    // after connection is established, setup WS proxy to TCP server
    // this is required for our client to connect
    wss.on('connection', (ws, req) => {
        let proxy = new WSProxy(ws, req, {
            debug: config.logProxy,
        });
        // cleanup on socket closed
        ws.on('close', () => {
            proxy = null;
        })
    });

    // Start web servers
    httpServer.listen(config.port, config.host, () => {
        const address = httpServer.address();
        // @ts-ignore
        console.log(`Process ${process.pid} is listening http://${address.address}:${address.port}/`)
    });

    if (config.useSSL) {
        httpsServer.listen(config.portHttps, config.host, () => {
            const address = httpsServer.address();
            // @ts-ignore
            console.log(`Process ${process.pid} is listening https://${address.address}:${address.port}/`)
        });
    }
}
