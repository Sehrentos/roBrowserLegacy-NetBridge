import { createReadStream } from 'fs';
import { send404 } from '../response/send404.js';
import { send500 } from '../response/send500.js';
import { getContentTypeExt } from './getContentTypeExt.js';

/**
 * Helper to stream the file as response.
 * 
 * @param {import("http").ServerResponse} response 
 * @param {string} filepath 
 */
export function streamFile(response, filepath) {
    try {
        const readStream = createReadStream(filepath);
        readStream.on('error', (error) => {
            // @ts-ignore
            console.error(`${process.pid} ServerRequest.streamFile: ${error.message} ${error.code}`);
            // @ts-ignore
            if (error.code == 'ENOENT') {
                return send404(response);
            }
            send500(response);
        })
        const contentType = getContentTypeExt(filepath);
        response.setHeader('Content-Type', contentType);
        readStream.pipe(response);
    } catch (error) {
        console.error(`${process.pid} ServerRequest.streamFile: ${error.message} ${error.code}`);
        if (error.code == 'ENOENT') {
            return send404(response);
        }
        send500(response);
    }
}