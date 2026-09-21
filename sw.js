"use strict";

var CACHE_NAME = "campfire-songs-v3";
var PRECACHE_URLS = [
  "index.html",
  "tuner.html",
  "style.css",
  "script.js",
  "contact.js",
  "contact.css",
  "tuner.js",
  "tuner.css",
  "pwa.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
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
