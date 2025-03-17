import path from "path";
import { fileURLToPath } from "url";
import { access, constants } from "fs/promises";
import { loadGRF } from "../modules/loadGRF.js";
import { send404 } from "../response/send404.js";
import { getContentTypeExt } from "../utils/getContentTypeExt.js";
import { parseLuaFile } from "../utils/parseLuaFile.js";
import { sendFile } from "../utils/sendFile.js";
import { setCORS } from "../middleware/setCORS.js";
import { parseURL } from "../utils/parseURL.js";
import config from "../../config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_ROOT = path.resolve(__dirname, '../../');

/**
 * serve any assets from /resources
 * Note: AI files are inside /AI and /data/ai/ folders
 * 
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
export async function onResourcesRequest(req, res) {
    let filepath = decodeURI(parseURL(req, path.join(DIR_ROOT, '/resources')));
    const url = new URL(req.url || "/", `${config.useSSL ? 'https' : 'http'}://${req.headers.host || config.host}${req.url}`);

    setCORS(req, res); // required for localhost

    // check if the file exists
    try {
        await access(filepath, constants.F_OK);

        // check was the file an .lua or .lub file
        if (/\.(lua|lub)$/.test(filepath)) {
            await sendFile(res, filepath, {
                cache: config.cacheControl, // use env cache-control value
                onBeforeSend: (content) => {
                    return Buffer.from(parseLuaFile(content.toString('utf-8')));
                }
            });
            if (config.logHttp) console.log(`200 ${process.pid} ${filepath}`)
            return; // Route handled; asset served.
        }

        // non-lua file
        await sendFile(res, filepath, {
            cache: config.cacheControl, // use env cache-control value
        });
        if (config.logHttp) console.log(`200 ${process.pid} ${filepath}`)
        return; // Route handled; asset served.

    } catch (error) {
        // initialize GRF reading process
        try {
            const decodedUrlPathname = decodeURI(url.pathname);
            const grfFileData = await loadGRF(decodedUrlPathname);
            /** @type {Buffer<ArrayBuffer>|Buffer<Uint8Array<ArrayBufferLike>>} */
            let buf = Buffer.from(grfFileData);
            // check was the file an .lua or .lub file
            if (/\.(lua|lub)$/.test(filepath)) {
                buf = Buffer.from(parseLuaFile(buf.toString('utf-8')));
            }
            const headers = {
                'Content-Length': buf.byteLength, //Buffer.byteLength("my string content"),
                'Content-Type': getContentTypeExt(filepath),
                'X-Powered-By': 'Magic',
            }
            if (config.cacheControl) {
                headers['Cache-control'] = `public, max-age=${config.cacheControl}` // 12 hours cache
            }
            res.writeHead(200, headers);
            res.end(buf, 'utf-8');
            if (config.logHttp) console.log(`200 ${process.pid} GRF ${decodedUrlPathname}`)
        } catch (grfError) {
            const msg1 = error.code || error.message || error;
            const msg2 = grfError.code || grfError.message || grfError;
            console.error(`404 ${process.pid} GRF error ${decodeURI(url.pathname)}:`, msg1, msg2);
            send404(res);
        }
    }
}