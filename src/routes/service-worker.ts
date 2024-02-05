import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';
import {
    cleanupOutdatedCaches,
    precacheAndRoute
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

const buildDate = TASTORIA_BUILD.DATE;
const version = TASTORIA_BUILD.VERSION;
const host = self.location.hostname;

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
        '/manifest.json',
        ...[ '128', '144', '152', '192', '256' ].map(size => `images/logo_${size}.png`),
        'fonts/PlayfairDisplay-ExtraBoldItalic.ttf'
    ];

    // eslint-disable-next-line unicorn/no-useless-spread
    precacheAndRoute([
        ...staticFiles.map(url => ({
            url,
            revision
        }))
    ]);

    registerRoute(
        /\/build\/*$/,
        new StaleWhileRevalidate({
            cacheName : 'static-resources'
        })
    );

    registerRoute(
        /.*\/q-data.json$/,
        new StaleWhileRevalidate({
            cacheName : 'q-data'
        })
    );

    registerRoute(
        ({ request }) => {
            return request.method === 'GET'
            && request.destination === 'document'
            && request.url.includes(host);
        },
        new StaleWhileRevalidate({
            cacheName : 'pages'
        })
    );

    registerRoute(
        ({ request }) => {
            return request.destination === 'image';
        },
        new CacheFirst({
            cacheName : 'image'
        })
    );

    // registerRoute(
    //     /\/api\/sync\/recipes/,
    //     new NetworkOnly({
    //         plugins : [ new BackgroundSyncPlugin('sync-queue', {
    //             maxRetentionTime : 24 * 60 // in minutes
    //         }) ]
    //     }),
    //     'POST'
    // );

    cleanupOutdatedCaches();
    setupServiceWorker();
    console.log(prefix, 'setup');
} catch (error) {
    setupServiceWorker();

    console.error(prefix, error);
}
