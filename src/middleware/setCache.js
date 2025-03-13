/**
 * Cache response
 * @param {import("http").IncomingMessage} req 
 * @param {import("http").ServerResponse} res 
 * @param {number} period in seconds. default: `60 * 60 * 12` (1 day)
 */
export function setCache(req, res, period = 60 * 60 * 12) {
    // here you can define period in second, this one is 1 day
    // const period = 60 * 60 * 12; // sec * min * hour

    // you only want to cache for GET requests x in seconds
    if (req.method == 'GET') {
        res.setHeader('Cache-control', `public, max-age=${period}`)
    } else {
        // for the other requests set strict no caching parameters
        res.setHeader('Cache-control', `no-store`)
    }
}