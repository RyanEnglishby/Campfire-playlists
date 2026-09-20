"use strict";

var CACHE_NAME = "campfire-songs-v1";
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

// Stale-while-revalidate: serve instantly from cache when available, and
// refresh the cache from the network in the background for next time. Keeps
// the app feeling instant without permanently freezing content that ships
// updates often.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var networkFetch = fetch(event.request)
          .then(function (response) {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(function () {
            return cached;
          });
        return cached || networkFetch;
      });
    })
  );
});
