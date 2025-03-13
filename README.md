roBrowserLegacy NetBridge
=======================

This NodeJS server is made to serve assets for the [roBrowserLegacy](https://github.com/MrAntares/roBrowserLegacy) project.

It serves assets to browser via HTTP/HTTPS from resources directory and supports extracting data from compressed files.

It also has some default caching and uses wsproxy to bridge data from WebSocket to TCP/IP.

- GRF version 0x200 is supported. No DES encryption.
- Resources get cache-control set for 12-hours (optional).

## Install
```sh
npm install
```

## Start the server
```sh
npm run start
```

## Configure

Current project structure is something like this:
- /projects
  - /roBrowserLegacy
  - **/roBrowserLegacy-NetBridge** *(this project)*
  - /rathena
  - /Hercules

### Config client

Configure the server address and port in the roBrowserLegacy project. Here are some examples:

- Edit [/public/index.html](./public/index.html) and search for `window.ROConfig` Object. *Note: this project specific file.*
- Edit `roBrowserLegacy/tools/builder-web.js` and search for `function createHTML()` before the build. *Note: this will generate dist/Web assets.*
- Edit `roBrowserLegacy/dist/Web/index.html` and search for `window.ROConfig` Object. *Note: this will be regenerated on each build.*

You can also make your own. It basically only needs to have the `window.ROConfig` Object and load `Online.js` file generated by the roBrowserLegacy project.

`window.ROConfig` properties to change:
- remoteClient = e.g. `"http://127.0.0.1/"`
- servers:
  - address = e.g. `"127.0.0.1"`
  - port = e.g. `6900`
  - packerver = e.g. `20131223`
  - socketProxy = e.g. `"ws://127.0.0.1/"`

### Config server

Configure the server options in the [.env](./.env) file. **Note: create one, if it does not exists.**

Here is an example:
```env
# configuration
NODE_ENV=development
HOST=127.0.0.1
PORT=80
PORT_SSL=443
# logging / debugging
LOG_HTTP=false
LOG_PROXY=false
# relative path to public assets directory
DIR_PUBLIC=public/
# relative path to roBrowserLegacy project
DIR_ROBROWSER=../roBrowserLegacy
# use multi-core process with cluster module
USE_CLUSTER=true
# enable SSL/HTTPS
USE_SSL=false
# certificates
SSL_KEY=./certs/localhost.key
SSL_CERT=./certs/localhost.crt
```

### SSL Certificate
For secure HTTPS put your certificates in the `/certs` directory and configure `SSL_KEY, SSL_CERT` in the `.env` file. 

- See certs [README](./certs/README.md) for more info.
- WebSocket requires secure connection.

### Client resources
Put GRF, BGM audio, AI lua/lub, System lua/lub files in the `/resources` directory.

- If you have uncompressed data resources, put them in `/data` subdirectory.
- See resources [README](./resources/README.md) for more info.

## Modules
- [grf-loader](https://github.com/vthibault/grf-loader/)
- [websockets/ws](https://github.com/websockets/ws)

## Credits
- [roBrowser](https://github.com/vthibault/roBrowser) [Vincent Thibault](https://github.com/vthibault) & all the contributors.
- [roBrowserLegacy](https://github.com/MrAntares/roBrowserLegacy) & all the contributors.
- The [WSProxy class](./src/modules/WSProxy.js) is based on [herenow](https://github.com/herenow)'s [wsProxy](https://github.com/herenow/wsProxy)

## To-Do
- Change possibly express, restana or fastify for server implementation. Depends how complex the requests will become. 
As for now they are very simple, so i decided not to use any library for now.