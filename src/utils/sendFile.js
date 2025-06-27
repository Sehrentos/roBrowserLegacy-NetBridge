import { readFile } from "fs/promises";
import { getContentTypeExt } from "./getContentTypeExt.js";

/**
 * Helper to send files from public directory. Note: you can check `error.code === "ENOENT"` for 404 when thrown.
 * 
 * @param {import("http").ServerResponse} response 
 * @param {string} filepath 
 * @param {Object} [options]
 * @param {string} [options.cache] Set Cache-control example: `max-age=43200` (12 hours). default: `no-cache`
 * @param {(content:Buffer) => Buffer<ArrayBufferLike>} [options.onBeforeSend] callback before send file, if you need to access the file content before it's sent
 * 
 * @returns {Promise<void>}
 */
export async function sendFile(response, filepath, options) {
    const _options = Object.assign({
        cache: "no-cache",
    }, options);

    // get header Content-Type
    const contentType = getContentTypeExt(filepath);

    // read file buffer
    let content = await readFile(filepath)

    // optional callback to process content
    if (_options.onBeforeSend) {
        content = _options.onBeforeSend(content);
    }

    // Send OK 200 response
    const headers = {
        'Content-Length': content.byteLength, //Buffer.byteLength("my string content"),
        'Content-Type': contentType,
        'X-Powered-By': 'Magic',
    };
    if (_options.cache) {
        headers['Cache-control'] = _options.cache
    }
    response.writeHead(200, headers);
    response.end(content, 'utf-8');
}