import path from 'path';
import http from 'http';
import { access, constants } from 'fs/promises';
import { fileURLToPath } from 'url';
import { send404 } from '../response/send404.js';
import { send500 } from '../response/send500.js';
import { sendFile } from '../utils/sendFile.js';
import { parseURL } from '../utils/parseURL.js';
import { fixCommonTypos } from '../utils/fixCommonTypos.js';
import { setCache } from '../middleware/setCache.js';
import { onResourcesRequest } from './onResourcesRequest.js';
import config from '../../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ROOT = path.resolve(__dirname, '../../');
const DIR_PUBLIC = path.join(DIR_ROOT, config.dirPublic);
const DIR_ROBROWSER = path.join(DIR_ROOT, config.dirROBrowser);

/**
 * Listener entry request
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
export async function onEntryRequest(req, res) {
    try {
        // fix common typos in requests
        // these usually comes from the roBrowser project
        req.url = fixCommonTypos(req.url); // TODO remove in the future
        const url = new URL(req.url || "/", `${config.useSSL ? 'https' : 'http'}://${req.headers.host || config.host}${req.url}`);

        // serve any assets from /resources
        // Note: AI files are inside /AI and /data/ai/ folders
        if (/^\/(AI|BGM|data|resources|System|SystemEN)\/(.+)$/i.test(url.pathname)) {
            return onResourcesRequest(req, res);
        }

        // serve public directory assets
        if (req.method === 'GET') {
            try {
                const filepath = parseURL(req, DIR_PUBLIC);
                await access(filepath, constants.F_OK);
                await sendFile(res, filepath, { cache: 0 });
                if (config.logHttp) console.log(`200 ${process.pid} ${filepath}`)
                return; // Route handled; asset served.
            } catch (er) {
                // silent
            }
        }

        // serve roBrowser web directory assets
        if (req.method === 'GET') {
            try {
                const filepath = parseURL(req, path.join(DIR_ROBROWSER, "dist/Web"));
                await access(filepath, constants.F_OK);
                await sendFile(res, filepath, { cache: 0 });
                if (config.logHttp) console.log(`200 ${process.pid} ${filepath}`)
                return; // Route handled; asset served.
            } catch (er) {
                // silent
            }
        }

        // serve blank favicon when it does not exist
        if (url.pathname === '/favicon.ico') {
            setCache(req, res);
            res.writeHead(200, { 'Content-Type': 'image/x-icon' });
            return res.end();
        }

        // no other request methods are implemented,
        // but you can add them below if you need.
        // POST, PUT, DEL, etc.
        send404(res);

    } catch (error) {
        // catch any sync errors
        console.error(`${process.pid} RequestError:`, error);
        send500(res);
    }
}
