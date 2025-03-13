///<reference path="../types/ServiceWorker.d.ts" />
// PWA service-worker.js for offline support
// and caching fetch requests with network first priority
const TAG = "service-worker.js";
/**
 * Cached version number.
 * 
 * By changing this value, you can update client's caches source files to reflect any changes in UI or service worker.
 * For an example, if you only update client-side sources, you need to update this version number,
 * or the client continues to use cached sources and does not get latest updates in the UI.
 */
const CACHE_VERSION = 1;
const CACHE_NAME = "sw-robrowser-cache-v";
const CURRENT_CACHE = `${CACHE_NAME}${CACHE_VERSION}`;

/** These file will be cached on service install */
const CACHE_FILES = [
	//#region public
	'/', //=index.html
	'/favicon.svg',
	'/styles.css',
	'/manifest.json',
	'/offline.html',
	'/service-worker.js',
	//#endregion
	//#region roBrowser
	// '/Online.js',
	// '/ThreadEventHandler.js',
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
	console.log(`${TAG} ${event.type}:`, event)
	event.waitUntil(
		// remove old caches first
		caches.keys()
			.then((cacheNames) => Promise.all(cacheNames.map((cacheName) => {
				if (cacheName.includes(CACHE_NAME)) {
					console.log(`${TAG} delete cache: ${cacheName}`)
					return caches.delete(cacheName)
				}
				console.log(`${TAG} skip delete cache: ${cacheName}`)
			})))
			.then(() => caches.open(CURRENT_CACHE).then((cache) => { // add new cache
				console.log(`${TAG} add cache: ${CURRENT_CACHE}`, CACHE_FILES)
				return cache.addAll(CACHE_FILES)
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
	console.log(`${TAG} ${event.type}:`, event)
	event.waitUntil(
		_self.clients.claim() // this service worker as new controller, triggering "controllchange" event.
	)
});

// Fetch in network first priority and then cache.
_self.addEventListener('fetch', (/** @type {FetchEvent} */event) => {
	const url = new URL(event.request.url)
	// console.log(`${TAG} ${event.type}:`, url.pathname, event)
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
		console.log("Found response in cache:", cachedResponse);
		return cachedResponse;
	}
	console.log("Falling back to network");
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
		console.log("Found response in network:", responseClone);
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
		console.log("Found response in cache:", cachedResponse);
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
		console.log("Found response in network:", responseClone);
		return response;
	}).catch((error) => {
		// Check if the requested resource is cached.
		return cacheOnly(request);
	})
}