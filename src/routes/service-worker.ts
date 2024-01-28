import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';

// const myPlugin = {
//     cacheWillUpdate : async ({ request, response, event, state }) => {
//         // Return `response`, a different `Response` object, or `null`.
//         return response;
//     },
//     cacheDidUpdate : async ({
//         cacheName,
//         request,
//         oldResponse,
//         newResponse,
//         event,
//         state
//     }) => {
//         // No return expected
//         // Note: `newResponse.bodyUsed` is `true` when this is called,
//         // meaning the body has already been read. If you need access to
//         // the body of the fresh response, use a technique like:
//         // const freshResponse = await caches.match(request, {cacheName});
//     },
//     cacheKeyWillBeUsed : async ({ request, mode, params, event, state }) => {
//         // `request` is the `Request` object that would otherwise be used as the cache key.
//         // `mode` is either 'read' or 'write'.
//         // Return either a string, or a `Request` whose `url` property will be used as the cache key.
//         // Returning the original `request` will make this a no-op.
//         return request;
//     },
//     cachedResponseWillBeUsed : async ({
//         cacheName,
//         request,
//         matchOptions,
//         cachedResponse,
//         event,
//         state
//     }) => {
//         // Return `cachedResponse`, a different `Response` object, or null.
//         return cachedResponse;
//     },
//     requestWillFetch : async ({ request, event, state }) => {
//         // Return `request` or a different `Request` object.
//         return request;
//     },
//     fetchDidFail : async ({ originalRequest, request, error, event, state }) => {
//         // No return expected.
//         // Note: `originalRequest` is the browser's request, `request` is the
//         // request after being passed through plugins with
//         // `requestWillFetch` callbacks, and `error` is the exception that caused
//         // the underlying `fetch()` to fail.
//     },
//     fetchDidSucceed : async ({ request, response, event, state }) => {
//         // Return `response` to use the network response as-is,
//         // or alternatively create and return a new `Response` object.
//         return response;
//     },
//     handlerWillStart : async ({ request, event, state }) => {
//         // No return expected.
//         // Can set initial handler state here.
//     },
//     handlerWillRespond : async ({ request, response, event, state }) => {
//         // Return `response` or a different `Response` object.
//         return response;
//     },
//     handlerDidRespond : async ({ request, response, event, state }) => {
//         // No return expected.
//         // Can record final response details here.
//     },
//     handlerDidComplete : async ({ request, response, error, event, state }) => {
//         // No return expected.
//         // Can report any data here.
//     },
//     handlerDidError : async ({ request, event, error, state }) => {
//         // Return a `Response` to use as a fallback, or `null`.
//         return fallbackResponse;
//     }
// };


import { BackgroundSyncPlugin } from 'workbox-background-sync';

const buildDate = import.meta.env.PUBLIC_TASTORIA_BUILD_DATE;
const version = import.meta.env.PUBLIC_TASTORIA_VERSION;

declare const self: ServiceWorkerGlobalScope;

const revision = `${version} (${buildDate})`;
const prefix = `tastoria v.${revision}`;

console.log(prefix, 'service worker');


try {
    addEventListener('install', () => {
        self.skipWaiting();
        console.log(prefix, 'installed');
    });

    addEventListener('activate', () => {
        self.clients.claim();
        console.log(prefix, 'activated');
    });

    const staticFiles = [
        // '/manifest.json',
        ...[ '128', '144', '152', '192', '256' ]
            .map(size => `images/logo_${size}.png`),
        'fonts/PlayfairDisplay-ExtraBoldItalic.ttf'
    ];

    // eslint-disable-next-line unicorn/no-useless-spread
    precacheAndRoute([
        // { url: '/', revision },
        ...staticFiles.map(url => ({
            url,
            revision
        }))
    ]);

    // registerRoute(
    //     new NavigationRoute(createHandlerBoundToURL('/')),
    //     new StaleWhileRevalidate({ cacheName: 'pages' })
    // );

    registerRoute(
        ({ request }) => {
            return request.destination === 'image';
        },
        new CacheFirst({
            cacheName : 'image'
        })
    );

    registerRoute(
        /\/api\/sync\/recipes/,
        new NetworkOnly({
            plugins : [ new BackgroundSyncPlugin('recipes_sync_queue', {
                maxRetentionTime : 24 * 60 // Retry for max of 24 Hours (specified in minutes)
            }) ]
        }),
        'POST'
    );


    cleanupOutdatedCaches();
    setupServiceWorker();
    console.log(prefix, 'setup');
} catch (error) {
    console.error(prefix, error);
}
