import path from 'path';
/**
 * Helper to get Content-Type by filename extension
 * @param {string} filename eg. `"/demo/index.html"`
 * @returns {string} eg. `"text/html"`
 */
export function getContentTypeExt(filename) {
    const extname = path.extname(filename);
    let mime = 'text/html';
    switch (extname) {
        case '.htm':
        case '.html':
            mime = 'text/html';
            break;
        case '.css':
            mime = 'text/css';
            break;
        case '.xhtml':
            mime = 'application/xhtml+xml';
            break;
        case '.xml':
            mime = 'application/xml';
            break;
        case '.js':
            mime = 'application/javascript';
            break;
        case '.ts':
            mime = 'application/typescript';
            break;
        case '.json':
            mime = 'application/json';
            break;
        case '.pdf':
            mime = 'application/pdf';
            break;
        case '.png':
            mime = 'image/png';
            break;
        case '.bmp':
            mime = 'image/bmp';
            break;
        case '.gif':
            mime = 'image/gif';
            break;
        case '.jpg':
        case '.jpeg':
            mime = 'image/jpeg';
            break;
        case '.ico':
            mime = 'image/x-icon';
            break;
        case '.svg':
            mime = 'image/svg+xml';
            break;
        case '.wav':
            mime = 'audio/x-wav';
            break;
        case '.mp3':
            mime = 'audio/mp3';
            break;
        case '.oga':
            mime = 'audio/ogg';
            break;
        case '.mid':
        case '.midi':
            mime = 'audio/midi';
            break;
        case '.mpeg':
            mime = 'video/mpeg';
            break;
        case '.ogv':
            mime = 'video/ogg';
            break;
        case '.otf':
            mime = 'font/otf';
            break;
        case '.ttf':
            mime = 'font/ttf';
            break;
        case '.woff':
            mime = 'font/woff';
            break;
        case '.woff2':
            mime = 'font/woff2';
            break;
        case '.zip':
            mime = 'application/zip';
            break;
        case '.7z':
            mime = 'application/x-7z-compressed';
            break;
        // case '.lua':
        // case '.lub':
        //     mime = 'application/lua';
        //     break;
        default:
            mime = 'text/plain';
            break;
    }
    return mime;
}