/*!
 * Global Service Worker types
 */
type WorkerGlobalScope = EventTarget;

/** https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */
type UseCaptureOrOptions = boolean | { capture?: boolean, once?: boolean, passive?: boolean, signal?: AbortSignal }

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope */
interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
	/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting */
	readonly skipWaiting?: () => Promise<undefined>;

	/** https://developer.mozilla.org/en-US/docs/Web/API/Clients */
	readonly clients?: Clients;

	// method overloading not supported
	// addEventListener: (type: "activate", handler: (event: ActivateEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "fetch", handler: (event: FetchEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "install", handler: (event: InstallEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "message", handler: (event: MessageEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "notificationclick", handler: (event: NotificationClickEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "notificationclose", handler: (event: NotificationCloseEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "push", handler: (event: PushEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "pushsubscriptionchange", handler: (event: PushSubscriptionEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
	// addEventListener: (type: "sync", handler: (event: SyncEvent) => any, optionsOrCapture?: UseCaptureOrOptions) => void;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/Clients */
interface Clients {
	/** https://developer.mozilla.org/en-US/docs/Web/API/Clients/get */
	readonly get: (id: string) => Promise<Client>;

	/** https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll */
	readonly matchAll: (options?: { includeUncontrolled?: boolean, type?: "window" | "worker" | "sharedworker" | "all" }) => Promise<WindowClient[]>;

	/** https://developer.mozilla.org/en-US/docs/Web/API/Clients/openWindow */
	readonly openWindow: (url: string) => Promise<WindowClient>;

	/** https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim */
	readonly claim: () => Promise<undefined>;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/Client */
interface Client {
	readonly id: string;
	readonly type: string;
	readonly url: string;
	readonly postMessage: (message: any, transferables?: any) => void;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/WindowClient */
interface WindowClient extends Client {
	readonly focused: boolean;
	readonly visibilityState: "hidden" | "visible" | "prerender";
	readonly focus: () => Promise<WindowClient>;
	readonly navigate: (url: string) => Promise<WindowClient | null>;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent */
interface ExtendableEvent extends Event {
	/** https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil */
	readonly waitUntil: (promise: Promise<any>) => void;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent */
interface FetchEvent extends ExtendableEvent {
	readonly clientId: string;
	readonly handled: () => Promise<undefined>;
	readonly preloadResponse: () => Promise<Response | undefined>;
	readonly replaceClientId: string;
	readonly resultingClientId: string;
	readonly request: Request;
	/** https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith */
	readonly respondWith: (promise: Promise<Response>) => void;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/activate_event */
interface ActivateEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event */
interface InstallEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/message_event */
interface MessageEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event */
interface NotificationClickEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclose_event */
interface NotificationCloseEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event */
interface PushEvent extends ExtendableEvent {
	readonly data: PushMessageData;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData */
interface PushMessageData {
	readonly arrayBuffer: () => ArrayBuffer;
	readonly blob: () => Blob;
	readonly json: () => Object;
	readonly text: () => string;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/pushsubscriptionchange_event */
interface PushSubscriptionEvent extends ExtendableEvent {
	/** no implementation */
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/sync_event */
interface SyncEvent extends ExtendableEvent {
	readonly tag: string;
	readonly lastChange: string;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/controllerchange_event */
interface ControllerChangeEvent extends Event {
	/** no implementation */
}
