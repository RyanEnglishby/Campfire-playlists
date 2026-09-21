(function () {
  "use strict";
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      // updateViaCache: "none" stops the browser from ever satisfying the
      // sw.js update check from its own HTTP cache (GitHub Pages' CDN sends
      // a cacheable max-age on it) -- without this, a returning visitor can
      // keep running a stale service worker for a while after every deploy,
      // even though the update algorithm normally re-checks every 24h.
      // The explicit update() call forces that re-check to happen right now
      // instead of waiting for the browser's own schedule.
      navigator.serviceWorker
        .register("sw.js", { updateViaCache: "none" })
        .then(function (registration) {
          registration.update().catch(function () {});
        })
        .catch(function () {});
    });
  }
})();
