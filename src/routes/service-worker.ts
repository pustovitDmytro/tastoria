import { setupServiceWorker } from "@builder.io/qwik-city/service-worker";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

const revision = import.meta.env.VITE_GIT_COMMIT_HASH;

precacheAndRoute([
  { url: "/", revision },
  { url: "/?pwa=true", revision },
  { url: "/manifest.webmanifest", revision },
  { url: "/icon/logo_192.png", revision },
  { url: "/icon/logo_256.png", revision },
  { url: "/icon/logo_384.png", revision },
  { url: "/icon/logo_512.png", revision },
]);

cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("/")));
registerRoute(new NavigationRoute(createHandlerBoundToURL("/?pwa=true")));
registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "image",
  new CacheFirst(),
);

setupServiceWorker();

addEventListener("install", () => self.skipWaiting());

addEventListener("activate", () => self.clients.claim());

declare const self: ServiceWorkerGlobalScope;