import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';
import {
    cleanupOutdatedCaches,
    precacheAndRoute
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

const buildDate = TASTORIA_BUILD.DATE;
const version = TASTORIA_BUILD.VERSION;
const host = self.location.hostname;
const daySeconds = 60 * 60 * 24;

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
            cacheName : 'static-resources',
            plugins   : [
                new ExpirationPlugin({
                    maxAgeSeconds : 30 * daySeconds
                })
            ]
        })
    );

    registerRoute(
        /.*\/q-data.json$/,
        new StaleWhileRevalidate({
            cacheName : 'q-data',
            plugins   : [
                new ExpirationPlugin({
                    maxAgeSeconds : 7 * daySeconds
                })
            ]
        })
    );

    registerRoute(
        ({ request }) => {
            return request.method === 'GET'
            && request.destination === 'document'
            && request.url.includes(host);
        },
        new StaleWhileRevalidate({
            cacheName : 'pages',
            plugins   : [
                new CacheableResponsePlugin({
                    statuses : [ 200, 302 ]
                }),
                new ExpirationPlugin({
                    maxAgeSeconds : 7 * daySeconds
                })
            ]
        })
    );

    registerRoute(
        ({ request }) => {
            return request.destination === 'image';
        },
        new CacheFirst({
            cacheName : 'image',
            plugins   : [
                new CacheableResponsePlugin({
                    statuses : [ 200, 302 ]
                }),
                new ExpirationPlugin({
                    maxAgeSeconds : 90 * daySeconds
                })
            ]

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
