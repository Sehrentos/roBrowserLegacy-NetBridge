///<reference path="../types/ServiceWorker.d.ts" />
// PWA service-worker.js for offline support
// and caching fetch requests with network first priority
const TAG = "service-worker.js";
const DEBUG = false; // optional. set to true to debug

/**
 * Cached version number (IMPORTANT).
 * 
 * By changing this value, you can update client's caches source files to reflect any changes.
 * For an example, if you only update client-side sources, you need to update this version number,
 * or the client continues to use cached sources and does not get latest updates.
 */
const CACHE_VERSION = 1;
const CACHE_NAME = "sw-robrowser-cache-v";
const CURRENT_CACHE = `${CACHE_NAME}${CACHE_VERSION}`;

/**
 * These file will be cached on service install (ServiceWorker cached files)
 */
const CACHE_FILES = [
	//#region public
	'/',
	'/index.html',
	'/favicon.svg',
	//'/index.js', // disable cache for development
	'/styles.css',
	'/manifest.json',
	'/offline.html',
	'/service-worker.js',
	//#endregion
	//#region roBrowser
	//'/Online.js', // disable cache for development
	//'/ThreadEventHandler.js', // disable cache for development
	'/wasmoon-lua5.1@1.18.10/dist/liblua5.1.wasm', // CDN https://unpkg.com
	'/src/UI/Components/Intro/images/about.png',
	'/src/UI/Components/Intro/images/icon.png',
	'/src/UI/Components/Intro/images/settings.png',
	'/src/UI/Components/Intro/images/background.jpg',
	'/src/UI/Components/Intro/images/ribbon.png',
	'/src/UI/Components/Intro/images/box.jpg',
	'/src/UI/Components/Intro/images/play.png',
	'/src/UI/Components/Intro/images/play-down.png',
	//#endregion
];

/** @type {ServiceWorkerGlobalScope} */
const _self = self;

/**
 * Register and update the service worker.
 * 
 * First remove any old caches, that match the CACHE_NAME value.
 * Then save new pre-caches from CACHE_FILES array.
 * Now, anytime this service worker changes, caches are updated.
 */
_self.addEventListener('install', (/** @type {InstallEvent} */event) => {
	if (DEBUG) console.log(`${TAG} ${event.type}:`, event)
	event.waitUntil(
		// remove old caches first
		caches.keys()
			.then((cacheNames) => Promise.all(cacheNames.map((cacheName) => {
				if (cacheName.includes(CACHE_NAME)) {
					if (DEBUG) console.log(`${TAG} delete cache: ${cacheName}`)
					return caches.delete(cacheName)
				}
				if (DEBUG) console.log(`${TAG} skip delete cache: ${cacheName}`)
				return Promise.resolve(true)
			})))
			.then(() => caches.open(CURRENT_CACHE).then((cache) => { // add new cache
				if (DEBUG) console.log(`${TAG} add cache: ${CURRENT_CACHE}`, CACHE_FILES)
				return cache.addAll(CACHE_FILES).catch((err) => console.warn("cache.addAll failed.", err))
			}))
			.then(() => {
				// forces the waiting service worker to become the active service worker, also triggering "activate" event.
				// this is to force service worker updates to the client.
				_self.skipWaiting()
			})
	)
});

// When this service worker is activated.
_self.addEventListener('activate', (/** @type {ActivateEvent} */event) => {
	if (DEBUG) console.log(`${TAG} ${event.type}:`, event)
	event.waitUntil(
		_self.clients.claim() // this service worker as new controller, triggering "controllchange" event.
	)
});

// Fetch in network first priority and then cache.
_self.addEventListener('fetch', (/** @type {FetchEvent} */event) => {
	const url = new URL(event.request.url)
	// pre-cached source files use cache first priority
	if (CACHE_FILES.includes(url.pathname)) {
		event.respondWith(cacheFirst(event.request))
	} else {
		// Default to network then cache
		event.respondWith(networkFirst(event.request))
	}
});

/**
 * Cache falling back to network
 * @param {Request} request 
 */
async function cacheFirst(request) {
	const cachedResponse = await caches.open(CURRENT_CACHE).then((cache) => cache.match(request));
	if (cachedResponse) {
		if (DEBUG) console.log("cache:", cachedResponse.status, cachedResponse.url);
		return cachedResponse;
	}
	// Falling back to network
	return fetch(request).then((response) => {
		// response may be used only once
		// we need to save clone to put one copy in cache
		// and serve second one
		let responseClone = response.clone()

		// Don't cache the response, when it's a POST request or not successful.
		// Browsers do not support POST type response to be stored in cache.
		if (responseClone.status != 200 || request.method === 'POST') {
			return response;
		}

		// Cache the response
		caches.open(CURRENT_CACHE).then((cache) => {
			cache.put(request, responseClone)
		});

		// Return the response
		if (DEBUG) console.log("network:", responseClone.status, responseClone.url);
		return response;
	}).catch((error) => {
		// Check if the requested resource is cached.
		return cacheOnly(request);
	})
}

/**
 * Cache only
 * @param {Request} request 
 */
async function cacheOnly(request) {
	const cachedResponse = await caches.open(CURRENT_CACHE).then((cache) => cache.match(request));
	if (cachedResponse) {
		if (DEBUG) console.log("Found response in cache:", cachedResponse);
		return cachedResponse;
	}
	return Response.error();
}

/**
 * Network falling back to cache
 * @param {Request} request 
 */
async function networkFirst(request) {
	return fetch(request).then((response) => {
		// response may be used only once
		// we need to save clone to put one copy in cache
		// and serve second one
		let responseClone = response.clone()

		// Don't cache the response, when it's a POST request or not successful.
		// Browsers do not support POST type response to be stored in cache.
		if (responseClone.status != 200 || request.method === 'POST') {
			return response;
		}

		// Cache the response
		caches.open(CURRENT_CACHE).then((cache) => {
			cache.put(request, responseClone)
		});

		// Return the response
		if (DEBUG) console.log("network:", responseClone.status, responseClone.url);
		return response;
	}).catch((error) => {
		// Check if the requested resource is cached.
		return cacheOnly(request);
	})
}