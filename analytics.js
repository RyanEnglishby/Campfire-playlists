(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-WF4NH3TRKP";

  // Bootstraps gtag itself here (not an inline <script> in the HTML) so the
  // site's Content-Security-Policy can keep script-src strict with no
  // 'unsafe-inline' -- this file is same-origin, an inline block wouldn't be.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  // Every call goes through here: if gtag never loaded (ad blockers commonly
  // block Google Analytics specifically) this quietly does nothing instead
  // of throwing and affecting anything else on the page.
  function track(eventName, params) {
    if (typeof window.gtag !== "function") return;
    try { window.gtag("event", eventName, params || {}); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }

  // ---- Song opened / play-along started & paused (index.html) ----
  // Observes existing DOM state from the outside, same technique as
  // contact.js's chord-viewer watcher -- no edits to script.js at all.
  function observeChordViewer() {
    var viewer = $("chord-viewer");
    if (!viewer || typeof MutationObserver === "undefined") return;

    // setAttribute fires a mutation record even when the value doesn't
    // actually change (e.g. closing an already-paused sheet re-sets
    // aria-pressed="false"), so only react to a genuine state transition --
    // otherwise closing the modal would fire a spurious "paused" event.
    var wasOpen = false;
    var viewerObserver = new MutationObserver(function () {
      var isOpen = viewer.classList.contains("is-open");
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        var title = $("chord-title");
        track("song_opened", { song_title: title ? title.textContent.trim() : "" });
      }
    });
    viewerObserver.observe(viewer, { attributes: true, attributeFilter: ["class"] });

    var playToggle = $("chord-play-toggle");
    if (playToggle) {
      var wasPlaying = false;
      var toggleObserver = new MutationObserver(function () {
        var isPlaying = playToggle.getAttribute("aria-pressed") === "true";
        if (isPlaying === wasPlaying) return;
        wasPlaying = isPlaying;
        var title = $("chord-title");
        var songTitle = title ? title.textContent.trim() : "";
        track(isPlaying ? "playalong_started" : "playalong_paused", { song_title: songTitle });
      });
      toggleObserver.observe(playToggle, { attributes: true, attributeFilter: ["aria-pressed"] });
    }
  }

  // ---- Tuner opened / used (tuner.html) ----
  function observeTuner() {
    var startBtn = $("tuner-start");
    if (!startBtn) return;
    track("tuner_opened", {});
    startBtn.addEventListener("click", function () { track("tuner_used", {}); });
  }

  // ---- Song request / bug report submitted (index.html) ----
  // contact.js calls window.__campfireTrack(eventName) at the exact points
  // where it has already dispatched a message (Formspree success, or any of
  // its mailto-fallback paths) -- never on a validation failure, and never
  // with any of the form's own field values (no song/artist typed in, no
  // bug description, no email). Exposed as a guarded global rather than
  // matched off notice text, since that text has more successful phrasings
  // than are safe to keep pattern-matching against.
  function exposeContactHook() {
    window.__campfireTrack = function (eventName) { track(eventName, {}); };
  }

  function init() {
    observeChordViewer();
    observeTuner();
    exposeContactHook();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
