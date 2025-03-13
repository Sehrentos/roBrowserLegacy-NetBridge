/**
 * Allow CORS response
 * @param {import("http").IncomingMessage} req 
 * @param {import("http").ServerResponse} res 
 */
export function setCORS(req, res) {
    res.removeHeader('x-powered-by') // they don't need to know for security reasons
    // CORS
    res.setHeader('Access-Control-Allow-Headers', '*') // 'X-Custom-Header, Upgrade-Insecure-Requests'
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', '*') // 'POST, GET, OPTIONS'
    res.setHeader('Access-Control-Allow-Origin', '*')
    //res.setHeader('Access-Control-Allow-Origin', 'null')
    //res.setHeader('Access-Control-Allow-Origin', 'https://localhost')
    // res.setHeader('Content-Type', 'application/json')
    res.setHeader('x-content-type-options', 'nosniff')
    // good for debugging
    // console.log(`New request: ${req.url}`)
}