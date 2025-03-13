import net from 'net';

/**
 * WebSocket Proxy class to reflect data to TCP/IP server
 * 
 * This is based on [herenow](https://github.com/herenow)'s [wsProxy](https://github.com/herenow/wsProxy) module
 */
export class WSProxy {
    /**
     * TCPProxy constructor
     * @param {import("ws").WebSocket} ws - The WebSocket connection
     * @param {import("http").IncomingMessage} req - The HTTP request
     * @param {Object} [options] - optional. Options
     * @param {boolean} [options.debug] - Enable debug logging
     * @param {string|number} [options.tcpPort] - The TCP port to connect to
     * @param {string} [options.tcpHost] - The TCP host to connect to
     * 
     * @description
     * Setup TCP/IP receiver and send message to connected TCP/IP server
     * when the WebSocket connection is established, and relay data between
     * the two connections.
     */
    constructor(ws, req, options) {
        const _options = Object.assign({
            debug: false,
            tcpPort: "",
            tcpHost: "",
        }, options);

        this.ws = ws;
        this.debug = _options.debug;
        this.urlFrom = req.socket?.remoteAddress ?? '127.0.0.1';
        this.urlTo = (req?.url ?? '').substring(1);
        const args = this.urlTo.split(':');
        this.tcpHost = _options.tcpHost || args[0] || '127.0.0.1';
        this.tcpPort = Number(_options.tcpPort || args[1]) || 5999;

        this._onWSClose = this.onWSClose.bind(this);
        this._onWSError = this.onWSError.bind(this);
        this._onWsMessage = this.onWsMessage.bind(this);

        this._onTCPConnect = this.onTCPConnect.bind(this);
        this._onTCPClose = this.onTCPClose.bind(this);
        this._onTCPError = this.onTCPError.bind(this);
        this._onTCPData = this.onTCPData.bind(this);

        this.ws.on('close', this._onWSClose);
        this.ws.on('error', this._onWSError);
        this.ws.on('message', this._onWsMessage);

        if (this.debug) console.log(`${process.pid} request connection from '${this.urlFrom}' to '${this.urlTo}'.`/*, req.headers*/);
        this.tcp = net.connect(this.tcpPort, this.tcpHost);

        // Disable nagle's algorithm
        this.tcp.setTimeout(0);
        this.tcp.setNoDelay(true);

        this.tcp.on('close', this._onTCPClose);
        this.tcp.on('error', this._onTCPError);
        this.tcp.on('connect', this._onTCPConnect);
        this.tcp.on('data', this._onTCPData);
    }
    onWSError(error) {
        console.log(`${process.pid} (${this.urlTo}) ws error:`, error.message || error, error.code || '[no-code]');
    }
    onTCPError(error) {
        console.log(`${process.pid} (${this.urlTo}) tcp error:`, error.message || error, error.code || '[no-code]');
        // switch (error.code) {
        //     case 'ECONNREFUSED': break; // connection is refused
        //     case 'ERR_SOCKET_CLOSED_BEFORE_CONNECTION': break; // TCP unable to connect
        //     default:
        //         console.log(`${process.pid} socket Error:`, error.message || error, error.code || '[no-code]');
        //         break;
        // }
    }
    onTCPClose() {
        if (this.debug) console.log(`${process.pid} (${this.urlTo}) tcp connection has lost connection. unbinding and closing up...`);
        this.ws.off('close', this._onWSError);
        this.ws.off('error', this._onWSClose);
        this.ws.off('data', this._onWsMessage);
        this.ws.close();
        this.tcp.off('close', this._onTCPError);
        this.tcp.off('error', this._onTCPClose);
        this.tcp.off('connect', this._onTCPConnect);
        this.tcp.off('data', this._onTCPData);
        this.tcp.end();
        // reconnect to TCP server?
        // Note: do not reconnect because this is working as a proxy,
        // so it's the same as closing the websocket.
        // The client needs to know the connection is lost.
        // this.tcp.connect(this.tcpPort, this.tcpHost);
    }
    onWSClose() {
        if (this.debug) console.log(`${process.pid} (${this.urlTo}) ws has lost connection. unbinding and closing up...`);
        this.ws.off('close', this._onWSError);
        this.ws.off('error', this._onWSClose);
        this.ws.off('data', this._onWsMessage);
        this.tcp.off('close', this._onTCPError);
        this.tcp.off('error', this._onTCPClose);
        this.tcp.off('connect', this._onTCPConnect);
        this.tcp.off('data', this._onTCPData);
        this.tcp.end();
    }
    /**
     * https://github.com/websockets/ws/blob/master/doc/ws.md#event-message
     * @param {ArrayBuffer|Buffer|Buffer[]} data
     * @param {boolean} isBinary
     */
    onWsMessage(data, isBinary) {
        const buf = makeBuffer(data);
        if (this.debug) console.log(`s: ${this.tcpPort}`, isBinary, buf[0], buf.length, buf.toString());
        this.tcp.write(buf, (error) => {
            // @ts-ignore error.code can be undefined
            if (error) console.log(`${process.pid} (${this.urlTo}) tcp write error:`, error.message || error, error.code || '[no-code]');
        });
    }
    /**
     * https://nodejs.org/api/net.html#event-data
     * @param {Buffer|string} data
     */
    onTCPData(data) {
        const buf = makeBuffer(data);
        if (this.debug) console.log(`r: ${this.tcpPort}`, buf[0], buf.length, buf.toString());
        // detect received packet
        // if (buf[0] === 0x7f) {
        //     console.log('0x7f: ZC.NOTIFY_TIME', buf.readUInt32LE(2));
        // }
        this.ws.send(buf, { binary: true, compress: false }, (error) => {
            // @ts-ignore error.code can be undefined
            if (error) console.log(`${process.pid} (${this.urlTo}) ws write error:`, error.message || error, error.code || '[no-code]');
        });
    }
    onTCPConnect() {
        if (this.debug) console.log(`${process.pid} tcp connected to ${this.urlTo}`);
    }
}

/**
 * Make sure WebSocket|Socket data is Buffer
 * @param {ArrayBuffer|Buffer|Buffer[]|string} data
 * @returns {Buffer}
 */
function makeBuffer(data) {
    if (data instanceof Buffer) {
        return data;
    }
    if (data instanceof ArrayBuffer) {
        return Buffer.from(data);
    }
    if (Array.isArray(data)) {
        return Buffer.concat(data);
    }
    return Buffer.from(data);
}