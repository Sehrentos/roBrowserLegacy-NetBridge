import { loadEnv } from "./src/utils/loadEnv.js"
loadEnv('./.env');

/**
 * Server configuration file that will also load environment variables
 */
export default {
    environment: process.env.NODE_ENV || "development",
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT) || 80,
    portHttps: Number(process.env.PORT_SSL) || 443,
    logHttp: process.env.LOG_HTTP === "true", // asset logs
    logProxy: process.env.LOG_PROXY === "true", // proxy logs
    cacheControl: process.env.CACHE_CONTROL || "no-cache", // Client Cache-Control
    dirPublic: process.env.DIR_PUBLIC || "public/", // public/ or ../roBrowserLegacy/dist/Web
    dirROBrowser: process.env.DIR_ROBROWSER || "../roBrowserLegacy",
    /** use multi-core process with cluster module */
    cluster: process.env.USE_CLUSTER === "true", // default false
    useSSL: process.env.USE_SSL === "true", // set this to true when you have certs
    sslKey: process.env.SSL_KEY || "./certs/localhost.key", // key.pem
    sslCert: process.env.SSL_CERT || "./certs/localhost.crt", // cert.pem
}