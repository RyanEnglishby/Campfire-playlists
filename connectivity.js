// Camp Chord -- a small top banner reflecting real connectivity state.
// Shared across every page (index/tuner/account), independent of the
// service worker: sw.js already keeps the app shell, songs and chord
// sheets usable offline, but a visitor has no way to tell *why* a
// network-dependent action (signing in, syncing a memory, loading cover
// art) just silently failed or did nothing. This makes that visible and
// non-alarming rather than leaving it to look broken.
(function () {
  "use strict";

  function init() {
    var banner = document.createElement("div");
    banner.id = "connectivity-banner";
    banner.className = "connectivity-banner";
    banner.setAttribute("role", "status");
    banner.setAttribute("aria-live", "polite");
    banner.hidden = true;
    document.body.insertBefore(banner, document.body.firstChild);

    var backOnlineTimer = null;

    function setOffline() {
      if (backOnlineTimer) { window.clearTimeout(backOnlineTimer); backOnlineTimer = null; }
      banner.textContent = "You're offline — showing saved songs and pages. Sign-in, sync and search still need a connection.";
      banner.classList.remove("is-back-online");
      banner.classList.add("is-offline");
      banner.hidden = false;
    }

    function setOnline() {
      // Only announce "back online" if the banner was actually showing an
      // offline state a moment ago -- a page that loads online from a
      // fresh tab should never flash this on load.
      if (banner.hidden) return;
      banner.textContent = "Back online.";
      banner.classList.remove("is-offline");
      banner.classList.add("is-back-online");
      backOnlineTimer = window.setTimeout(function () {
        banner.hidden = true;
        banner.classList.remove("is-back-online");
      }, 2500);
    }

    window.addEventListener("offline", setOffline);
    window.addEventListener("online", setOnline);

    if (navigator.onLine === false) setOffline();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
