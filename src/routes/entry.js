import path from 'path';
import http from 'http';
import { access, constants } from 'fs/promises';
import { fileURLToPath } from 'url';
import { send404 } from '../response/send404.js';
import { send500 } from '../response/send500.js';
import { sendFile } from '../utils/sendFile.js';
import { parseURL } from '../utils/parseURL.js';
import { parseLuaFile } from '../utils/parseLuaFile.js';
import { fixCommonTypos } from '../utils/fixCommonTypos.js';
import { getContentTypeExt } from '../utils/getContentTypeExt.js';
import { setCache } from '../middleware/setCache.js';
import { setCORS } from '../middleware/setCORS.js';
import { loadGRF } from '../modules/loadGRF.js';
import config from '../../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ROOT = path.resolve(__dirname, '../../');
const DIR_PUBLIC = path.resolve(__dirname, '../../', config.dirPublic);
const DIR_ROBROWSER = path.resolve(__dirname, '../../', config.dirROBrowser);

// show logs etc.
const LOGS = config.logHttp;
const HOST_IPv4 = config.host;

/**
 * Listener entry request
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
export async function onEntryRequest(req, res) {
    try {
        // fix common typos in requests
        // these usually comes from the roBrowser project like "file.lua.lua"
        req.url = fixCommonTypos(req.url);
        const url = new URL(req.url || "/", `${config.useSSL ? 'https' : 'http'}://${req.headers.host || HOST_IPv4}${req.url}`);

        // (optional) serve blank favicon
        if (url.pathname === '/favicon.ico') {
            setCache(req, res);
            res.writeHead(200, { 'Content-Type': 'image/x-icon' });
            return res.end();
        }

        // #region Application Scripts
        if (url.pathname === '/Online.js') {
            const filepath = path.join(DIR_ROBROWSER, '/dist/Web/Online.js');
            sendFile(res, filepath, { debug: LOGS, cache: 0 });
            // streamFile(response, filepath); // big file, use streamFile
            return;
        }

        if (url.pathname === '/ThreadEventHandler.js') {
            const filepath = path.join(DIR_ROBROWSER, '/dist/Web/ThreadEventHandler.js');
            sendFile(res, filepath, { debug: LOGS, cache: 0 }); // small file, use sendFile
            return;
        }
        // #endregion

        // static /AI *.lua files
        // if (/AI\/(.*).lua$/.test(url.pathname)) {
        //     const filepath = parseURL(req, path.join(DIR_ROOT, '/resources'))
        //         .replace('.lua.lua', '.lua') // bugfix "<filename.extension>.lua.lua"
        //         .replace('//AI', '/AI')
        //     sendFile(res, filepath, { debug: LOGS });
        //     // streamFile(response, filepath);
        //     return;
        // }

        // static /BGM|data|resources|System/* files
        // Note: AI files are inside /AI and /data/ai/ folders
        if (/^\/(AI|BGM|data|resources|System|SystemEN)\/(.*)/i.test(url.pathname)) {
            setCORS(req, res); // required for http://localhost
            let filepath = parseURL(req, path.join(DIR_ROOT, '/resources'));
            // decode the filename, they may contain special characters
            const dataPath = filepath.match(/data\\(imf|lua%20files|luafiles514|model|palette|sprite|texture|wav)\\(.*)/);
            if (dataPath != null) {
                filepath = filepath.replace(dataPath[2], decodeURIComponent(dataPath[2]));
            }
            // check if the file exists
            try {
                await access(filepath, constants.F_OK);
                // check was the file an .lua or .lub file
                // then replace dofile with require
                // and fix paths like AI\\Const to AI/Const
                if (/\.(lua|lub)$/.test(filepath)) {
                    return sendFile(res, filepath, {
                        debug: LOGS,
                        onBeforeSend: (content) => {
                            return Buffer.from(parseLuaFile(content.toString('utf-8')));
                        }
                    });
                }
                // non-lua file
                return sendFile(res, filepath, { debug: LOGS });
            } catch (error) {
                // initialize GRF reading process
                try {
                    const grfFileData = await loadGRF(url.pathname);
                    /** @type {Buffer<ArrayBuffer>|Buffer<Uint8Array<ArrayBufferLike>>} */
                    let buf = Buffer.from(grfFileData);
                    // check was the file an .lua or .lub file
                    // then replace dofile with require
                    // and fix paths like AI\\Const to AI/Const
                    if (/\.(lua|lub)$/.test(filepath)) {
                        buf = Buffer.from(parseLuaFile(buf.toString('utf-8')));
                    }
                    if (LOGS) console.log(`${process.pid} GRF`, url.pathname, buf.byteLength);
                    res.writeHead(200, {
                        'Content-Length': buf.byteLength, //Buffer.byteLength("my string content"),
                        'Content-Type': getContentTypeExt(filepath),
                        'X-Powered-By': 'Magic',
                        'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hours cache
                    });
                    res.end(buf, 'utf-8');
                    return;
                } catch (grfError) {
                    console.error(`404 ${process.pid} GRF error ${url.pathname}:`, error.message || error);
                    send404(res);
                    return;
                }
            }
        }

        // static /src * files for the roBrowserLegacy like UI/Components images etc.
        // ROConfig.skipIntro=false requires these routes
        if (/src\/(.*)/.test(url.pathname)) {
            const filepath = parseURL(req, path.join(DIR_ROBROWSER, '/src'))
                .replace('src\\src\\', 'src\\')
                .replace('src/src/', 'src/')
            sendFile(res, filepath, { debug: LOGS, cache: 0 });
            // streamFile(response, filepath);
            return;
        }

        // fallback to public directory
        if (req.method === 'GET') {
            const filepath = parseURL(req, DIR_PUBLIC);
            // try to send requested file from our static dir, or 404 page
            sendFile(res, filepath, { debug: LOGS, cache: 0 });
            // streamFile(response, filepath);
            return;
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
