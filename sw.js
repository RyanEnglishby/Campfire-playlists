"use strict";

var CACHE_NAME = "campfire-songs-v7";
var OFFLINE_URL = "offline.html";
// How long to wait for the network before falling back to whatever's
// cached. Long enough that a normal mobile connection never hits it,
// short enough that a stalled connection (weak signal, a captive portal
// that never responds) doesn't leave a visitor staring at a blank tab.
var NETWORK_TIMEOUT_MS = 4000;

var PRECACHE_URLS = [
  "index.html",
  "tuner.html",
  "account.html",
  "offline.html",
  "style.css",
  "script.js",
  "contact.js",
  "contact.css",
  "tuner.js",
  "tuner.css",
  "memories.js",
  "memories.css",
  "groups.js",
  "groups.css",
  "chord-diagrams.js",
  "chord-diagrams.css",
  "artwork.js",
  "supabase-client.js",
  "auth.js",
  "auth.css",
  "account.js",
  "account.css",
  "analytics.js",
  "pwa.js",
  "connectivity.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-16.png",
  "icons/favicon-32.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

function isNavigation(request) {
  return request.mode === "navigate" || (request.headers.get("accept") || "").indexOf("text/html") !== -1;
}

// Network-first, cache as an offline fallback only. This site ships updates
// often, and stale-while-revalidate was serving the previous deploy's files
// for one full visit after every release (cache first, refresh in the
// background for *next* time) -- confusing after a just-shipped fix. Always
// prefer a fresh network response when online; fall back to cache only when
// the network truly fails or is too slow to matter, and keep the cache warm
// from whatever succeeds.
function respondNetworkFirst(request) {
  var networkFetch = fetch(request, { cache: "no-store" }).then(function (response) {
    if (response && response.status === 200) {
      var toCache = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(request, toCache); });
    }
    return response;
  });

  // Race the network against a timeout so a stalled connection falls back
  // to cache quickly instead of hanging. The network request itself is
  // never aborted -- if it does eventually succeed after the timeout,
  // the .then above still runs and warms the cache for next time, it
  // just won't be what this particular request waits for.
  var timedOut = new Promise(function (resolve) {
    setTimeout(function () { resolve(undefined); }, NETWORK_TIMEOUT_MS);
  });

  return Promise.race([networkFetch, timedOut])
    .then(function (response) { return response || caches.match(request); })
    .catch(function () { return caches.match(request); })
    .then(function (response) {
      if (response) return response;
      // Nothing cached either -- this exact URL was never successfully
      // loaded before, and the network just failed or timed out. For a
      // page navigation, show the branded offline page instead of the
      // browser's own bare connection-error screen; for any other asset
      // (an image, a script) there's nothing meaningful to serve.
      if (isNavigation(request)) return caches.match(OFFLINE_URL);
      return new Response("", { status: 504, statusText: "Offline" });
    });
}

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  // Never intercept cross-origin requests -- leave the browser's normal
  // handling in place for them. This was always true in spirit (nothing
  // cross-origin was ever in PRECACHE_URLS), but the fetch handler itself
  // used to cache *any* successful GET response regardless of origin,
  // Supabase REST calls included. That was never actually exploitable --
  // every per-user query already filters by the caller's own id in the
  // URL, so a cache hit could only ever replay that same account's own
  // prior response -- but with several per-user data domains (favourites,
  // learning progress, practice history, heard-tracking, room participation)
  // flowing through this exact path, it's not worth leaving that safety
  // margin resting entirely on every future query remembering to filter
  // correctly. Supabase auth/session requests in particular must always
  // reach the real network, never a cached response.
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(respondNetworkFirst(event.request));
});
