"use strict";

var CACHE_NAME = "campfire-songs-v6";
var PRECACHE_URLS = [
  "index.html",
  "tuner.html",
  "account.html",
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
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "images/campfire-gathering.webp"
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

// Network-first, cache as an offline fallback only. This site ships updates
// often, and stale-while-revalidate was serving the previous deploy's files
// for one full visit after every release (cache first, refresh in the
// background for *next* time) -- confusing after a just-shipped fix. Always
// prefer a fresh network response when online; fall back to cache only when
// the network truly fails, and keep the cache warm from whatever succeeds.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  // Never intercept cross-origin requests -- leave the browser's normal
  // handling in place for them. This was always true in spirit (nothing
  // cross-origin was ever in PRECACHE_URLS), but the fetch handler itself
  // used to cache *any* successful GET response regardless of origin,
  // Supabase REST calls included. That was never actually exploitable --
  // every per-user query already filters by the caller's own id in the
  // URL, so a cache hit could only ever replay that same account's own
  // prior response -- but now that several more per-user data domains
  // (favourites, learning progress, practice history, heard-tracking, room
  // participation) flow through this exact path, it's not worth leaving
  // that safety margin resting entirely on every future query remembering
  // to filter correctly.
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(function (response) {
        if (response && response.status === 200) {
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, toCache); });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
