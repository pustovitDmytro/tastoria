import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

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
        '/manifest.json',
        ...[ '128', '144', '152', '192', '256' ]
            .map(size => `images/logo_${size}.png`),
        'fonts/PlayfairDisplay-ExtraBoldItalic.ttf'
    ];

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
