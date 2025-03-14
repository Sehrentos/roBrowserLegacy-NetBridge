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
    let filepath = parseURL(req, path.join(DIR_ROOT, '/resources'));
    const url = new URL(req.url || "/", `${config.useSSL ? 'https' : 'http'}://${req.headers.host || config.host}${req.url}`);

    setCORS(req, res); // required for localhost

    // decode the filename, they may contain special characters
    const dataPath = filepath.match(/data\\(imf|lua%20files|luafiles514|model|palette|sprite|texture|wav)\\(.*)/);
    if (dataPath != null) {
        filepath = filepath.replace(dataPath[2], decodeURIComponent(dataPath[2]));
    }

    // check if the file exists
    try {
        await access(filepath, constants.F_OK);
        // check was the file an .lua or .lub file
        if (/\.(lua|lub)$/.test(filepath)) {
            return sendFile(res, filepath, {
                debug: config.logHttp,
                onBeforeSend: (content) => {
                    return Buffer.from(parseLuaFile(content.toString('utf-8')));
                }
            });
        }
        // non-lua file
        sendFile(res, filepath, { debug: config.logHttp });
    } catch (error) {
        // initialize GRF reading process
        try {
            const decodedUrlPathname = decodeURIComponent(url.pathname);
            const grfFileData = await loadGRF(decodedUrlPathname);
            /** @type {Buffer<ArrayBuffer>|Buffer<Uint8Array<ArrayBufferLike>>} */
            let buf = Buffer.from(grfFileData);
            // check was the file an .lua or .lub file
            if (/\.(lua|lub)$/.test(filepath)) {
                buf = Buffer.from(parseLuaFile(buf.toString('utf-8')));
            }

            if (config.logHttp) console.log(`${process.pid} GRF`, decodedUrlPathname, buf.byteLength);

            res.writeHead(200, {
                'Content-Length': buf.byteLength, //Buffer.byteLength("my string content"),
                'Content-Type': getContentTypeExt(filepath),
                'X-Powered-By': 'Magic',
                'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hours cache
            });

            res.end(buf, 'utf-8');
        } catch (grfError) {
            console.error(`404 ${process.pid} GRF error ${decodeURIComponent(url.pathname)}:`, error.message || error);
            send404(res);
        }
    }
}