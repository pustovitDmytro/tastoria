import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { name, version } from '../../package.json';

const revision = `v.${version}`;
const prefix = `${name} ${revision}`;

console.log(prefix, 'service worker');

declare const self: ServiceWorkerGlobalScope;

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
    ...[ '128', '144', '152', '192', '256' ]
        .map(size => `images/logo_${size}.png`),
    'fonts/PlayfairDisplay-ExtraBoldItalic.ttf'
];

try {
    precacheAndRoute([
        { url: '/', revision },
        ...staticFiles.map(url => ({
            url,
            revision
        }))
    ]);

    registerRoute(new NavigationRoute(createHandlerBoundToURL('/')));
    registerRoute(
        ({ request }) => {
            return request.destination === 'image';
        },
        new CacheFirst({
            cacheName : 'image'
        })
    );

    cleanupOutdatedCaches();
    setupServiceWorker();
    console.log(prefix, 'setup');
} catch (error) {
    console.error(prefix, error);
}
