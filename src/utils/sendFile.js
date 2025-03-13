import { readFile } from "fs";
import { send404 } from "../response/send404.js";
import { getContentTypeExt } from "./getContentTypeExt.js";
import { send500 } from "../response/send500.js";

/**
 * Helper to send files from public directory.
 * 
 * @param {import("http").ServerResponse} response 
 * @param {string} filepath 
 * @param {Object} [options]
 * @param {boolean} [options.debug] use `true` for debug logs. default: `false`
 * @param {number} [options.cache] Set Cache-control. default: `43200` (12 hours). use `0` for no caching
 */
export function sendFile(response, filepath, options) {
    const _options = Object.assign({
        debug: false,
        cache: 60 * 60 * 12, // 12 hours
    }, options);
    // get header Content-Type
    const contentType = getContentTypeExt(filepath);

    // read file buffer and send it
    readFile(filepath, (error, content) => {
        if (error) {
            console.error(`404 ${process.pid} ${error.message} ${error.code}`)
            if (error.code == 'ENOENT') {
                return send404(response);
            }
            return send500(response);
        }
        // Ok, 200 response
        if (_options.debug) console.log(`200 ${process.pid} ${filepath}`)
        // set browser cache exists
        if (_options.cache) {
            response.writeHead(200, {
                'Content-Length': content.byteLength, //Buffer.byteLength("my string content"),
                'Content-Type': contentType,
                'X-Powered-By': 'Magic',
                'Cache-control': `public, max-age=${_options.cache}`,
            });
        } else {
            response.writeHead(200, {
                'Content-Length': content.byteLength, //Buffer.byteLength("my string content"),
                'Content-Type': contentType,
                'X-Powered-By': 'Magic',
            });
        }
        response.end(content, 'utf-8');
    });
}