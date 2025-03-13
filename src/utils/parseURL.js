import path from 'path';
/**
 * Helper to parse the request.url & header referer
 * 
 * @param {import("http").IncomingMessage} request 
 * @param {string=} staticDir optional
 * @returns {string} eg. `C:\Users\username\Documents\server-demo\public\index.html`
 */
export function parseURL(request, staticDir = "") {
    // referer: 'http://127.0.0.1/demo' (directory) to path consideration
    const referer = new URL(request.headers.referer || "", `https://${request.headers.host}`);
    const hasRefererExtension = path.extname(referer.pathname); // /login-fi.html

    // requested url: '/' or '/index.html' or '/demo'
    const url = new URL(request.url || "", `https://${request.headers.host}`);
    let filepath = '';
    if (hasRefererExtension) {
        // when both pathnames has extension, use the later one instead.
        // fixes issue: \sub\index.html\css\vendor.css
        filepath = path.join(staticDir, url.pathname);
    } else {
        filepath = path.join(staticDir, referer.pathname, url.pathname);
    }

    // check when url ends with an <file.extension>
    const hasExtension = path.extname(filepath);
    if (!hasExtension) {
        filepath = path.join(filepath, '/index.html');
    }
    return filepath;
}