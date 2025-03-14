// required RoBrowser config
window["ROConfig"] = {
    development: false,
    remoteClient: window.location.protocol + "//localhost/", // e.g. "https://127.0.0.1/"
    servers: [
        {
            display: 'Local server',
            desc: "Local server",
            address: '127.0.0.1',
            port: 6900,
            version: 46,
            langtype: 240, // 240=UTF-8
            packetver: 20131223, // must match the server
            packetKeys: false, // must disable packet obfuscation
            forceUseAddress: false,
            renewal: false, // Game mode PRE-RENEWAL or RENEWAL
            socketProxy: `${window.location.protocol == 'https:' ? 'wss' : 'ws'}://127.0.0.1/`,
            adminList: [/*2000000*/],
            aura: { defaultLv: 99, },
            enableHomunAutoFeed: true, // allow autofeed in older clients
            //homunAutoFeedTimeMs: 10000, // default 60000
        },
    ],
    packetDump: false,
    skipServerList: true, // this demo only has 1 server configured, so use it
    skipIntro: false, // optional. skip intro where you can drop your client assets
    clientVersionMode: 'PacketVer',
    // forceUseAddress: true,
    worldMapSettings: { // Settings for world map.
        episode: 98, // Episode content to show (0-98, eg:14.2, default:98 = latest)
        add: [],     // Optional, Array of maps to custom show  (eg: ['rachel', 'ra_fild01'])
        remove: []   // Optional, Array of maps to custom remove (eg: ['alberta', 'pay_fild03'])
    },
    plugins: {},
    clientHash: null,
    enableConsole: true,
    disableConsole: false,
    enableCashShop: false,
    enableBank: false,
    enableMapName: false,
    enableRefineUI: false,
    enableDmgSuffix: false,
    enableCheckAttendance: false,
    ThirdPersonCamera: false,
    FirstPersonCamera: false,
    CameraMaxZoomOut: 5,
    loadLua: false, // when you have old client like 2013 without all lua/lub files set this to false
};

// Helper to load script
function loadScript(src) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.getElementsByTagName('body')[0].appendChild(script);
}

// // Init
// (async () => { // for top level await
//     // check ServiceWorker support
//     if ("serviceWorker" in navigator) {
//         // PWA service worker registration
//         const serviceWorkerName = "service-worker.js"
//         const oldRegistration = await navigator.serviceWorker.getRegistration(serviceWorkerName)
//         if (oldRegistration) {
//             console.log('Old service worker is already registered.')
//         } else {
//             console.log('Register new service worker.')
//             try {
//                 await navigator.serviceWorker.register(serviceWorkerName)
//                 console.log('Service worker registered successfully.')
//             } catch (e) {
//                 console.log('Service worker registration failed.', e)
//             }
//         }

//         // First, do a one-off check if there's currently a service worker in control.
//         if (navigator.serviceWorker.controller) {
//             console.log("This page is currently controlled by:", navigator.serviceWorker.controller)
//             loadScript("Online.js");
//         }

//         // Then, register a handler to detect when a new or
//         // updated service worker takes control.
//         navigator.serviceWorker.addEventListener("controllerchange", () => {
//             // console.log("This page is now controlled by", navigator.serviceWorker.controller)
//             // optional: refresh the current page
//             if (window.confirm("ServiceWorker updated. Please reload the page to apply the changes.")) {
//                 return location.reload()
//             }
//         })

//     } else {
//         // No ServiceWorker support
//         loadScript("Online.js");
//     }
// })();

const SERVICE_WORKER_NAME = "service-worker.js"

async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            const existingRegistration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_NAME);

            if (existingRegistration) {
                console.log('Existing service worker found:', existingRegistration);
                // Optionally, perform updates or unregister if needed.
            } else {
                console.log('Registering new service worker.');
                const registration = await navigator.serviceWorker.register(SERVICE_WORKER_NAME);
                console.log('Service worker registered successfully.', registration);
            }

            if (navigator.serviceWorker.controller) {
                loadScript("Online.js");
            }

            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (window.confirm("ServiceWorker updated. Please reload the page to apply the changes.")) {
                    return location.reload();
                }
            });

        } catch (error) {
            console.error('Service worker registration failed:', error);
            // Display user-friendly error message
        }
    } else {
        console.warn('Service workers are not supported.');
        loadScript("Online.js");
    }
}

(async () => {
    await registerServiceWorker();
})();