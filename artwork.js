// Campfire Songs -- album artwork lookup.
//
// Source order per song: the Cover Art Archive (run by the Internet Archive
// and MusicBrainz, purpose-built for exactly this -- free, keyless, no
// promotional-use restriction) first, then the iTunes Search API as a
// fallback for songs the Archive doesn't have a cover for. If neither has
// anything, the caller's own placeholder design (see buildArtworkSlot in
// script.js) stays showing -- this module never breaks a song card, it only
// ever *upgrades* it once/if a real cover resolves.
//
// Every lookup is cached in localStorage forever (a song's cover art doesn't
// change), so the network cost above is paid at most once per browser, and
// only for songs the visitor actually scrolls to (see the IntersectionObserver
// in watch() below) -- nothing here blocks or slows down the initial page
// render.
(function () {
  "use strict";

  var CACHE_KEY = "campfire-artwork-cache-v1";
  var NOT_FOUND_TTL_MS = 14 * 24 * 60 * 60 * 1000; // re-try "nothing found" after 2 weeks
  var FETCH_TIMEOUT_MS = 6000;
  var MB_MIN_GAP_MS = 1100; // MusicBrainz asks for ~1 request/second, unauthenticated
  var MAX_CONCURRENT = 3; // be polite to the Cover Art Archive / iTunes too

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeCache(cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // storage full/unavailable (private browsing, quota) -- fine, just
      // means we look it up again next time instead of persisting it
    }
  }

  function getCached(songId) {
    var cache = readCache();
    var entry = cache[songId];
    if (!entry) return null;
    if (entry.src === null && Date.now() - entry.ts > NOT_FOUND_TTL_MS) return null; // stale negative result
    return entry;
  }

  function setCached(songId, entry) {
    var cache = readCache();
    cache[songId] = entry;
    cache[songId].ts = Date.now();
    writeCache(cache);
  }

  // ---- small fetch helper: timeout + always resolves (never throws) ----
  function fetchJson(url) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS) : null;
    return fetch(url, { signal: controller ? controller.signal : undefined, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) return null;
        return res.json().catch(function () { return null; });
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        return null;
      });
  }

  // Resolves true if the URL loads as an image, false otherwise. Doesn't
  // use fetch() for this -- letting the <img> itself attempt the load means
  // it goes straight into the browser's own image cache once it succeeds,
  // instead of loading the bytes twice.
  function probeImage(url) {
    return new Promise(function (resolve) {
      var probe = new Image();
      var settled = false;
      var timer = setTimeout(function () { if (!settled) { settled = true; resolve(false); } }, FETCH_TIMEOUT_MS);
      probe.onload = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(true);
      };
      probe.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(false);
      };
      probe.src = url;
    });
  }

  // ---- MusicBrainz request queue: at most one call in flight, spaced out ----
  var mbQueue = [];
  var mbTimer = null;
  var mbLastCallAt = 0;

  function pumpMbQueue() {
    if (mbTimer || !mbQueue.length) return;
    var wait = Math.max(0, MB_MIN_GAP_MS - (Date.now() - mbLastCallAt));
    mbTimer = setTimeout(function () {
      mbTimer = null;
      var job = mbQueue.shift();
      mbLastCallAt = Date.now();
      job();
      pumpMbQueue();
    }, wait);
  }

  function mbFetch(url) {
    return new Promise(function (resolve) {
      mbQueue.push(function () { fetchJson(url).then(resolve); });
      pumpMbQueue();
    });
  }

  // ---- small concurrency pool for everything else ----
  var activeCount = 0;
  var pending = [];
  function withPool(fn) {
    return new Promise(function (resolve) {
      var run = function () {
        activeCount++;
        fn().then(function (v) {
          activeCount--;
          if (pending.length) pending.shift()();
          resolve(v);
        });
      };
      if (activeCount < MAX_CONCURRENT) run();
      else pending.push(run);
    });
  }

  function escapeLucene(str) {
    return String(str).replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, "\\$1");
  }

  // Strips "feat. X" / "featuring X" so the search targets the primary
  // artist MusicBrainz/iTunes actually credit the release under.
  function primaryArtist(artist) {
    return artist.replace(/\s+(feat\.?|featuring)\s+.+$/i, "").trim();
  }

  function upsizeItunesArtwork(url) {
    return url.replace(/\/\d+x\d+bb\.(jpg|png)$/i, "/600x600bb.$1");
  }

  // Cover Art Archive: MusicBrainz recording search -> a release MBID for it
  // -> the Archive's own front-cover redirect endpoint for that release.
  function lookupCoverArtArchive(song) {
    var query = 'recording:"' + escapeLucene(song.title) + '" AND artist:"' + escapeLucene(primaryArtist(song.artist)) + '"';
    var url = "https://musicbrainz.org/ws/2/recording/?query=" + encodeURIComponent(query) + "&fmt=json&limit=3";
    return mbFetch(url).then(function (data) {
      var hits = (data && data.recordings) || [];
      var best = hits.filter(function (r) { return r.score >= 85 && r.releases && r.releases.length; })[0];
      if (!best) return null;
      // try each release attached to the recording until one actually has cover art
      var releases = best.releases.slice(0, 3);
      var tryNext = function (i) {
        if (i >= releases.length) return null;
        var imgUrl = "https://coverartarchive.org/release/" + releases[i].id + "/front-250";
        return withPool(function () { return probeImage(imgUrl); }).then(function (ok) {
          if (ok) return { src: imgUrl, viewUrl: null, source: "caa" };
          return tryNext(i + 1);
        });
      };
      return tryNext(0);
    });
  }

  // iTunes Search API fallback. Only used for songs the Cover Art Archive
  // doesn't have -- and when it's used, the artwork links back to the
  // song's Apple Music page (see script.js), matching Apple's own terms for
  // displaying "Promo Content" alongside a direct link to the store page.
  function lookupItunes(song) {
    var term = primaryArtist(song.artist) + " " + song.title;
    var url = "https://itunes.apple.com/search?term=" + encodeURIComponent(term) + "&media=music&entity=song&limit=1";
    return withPool(function () { return fetchJson(url); }).then(function (data) {
      var hit = data && data.results && data.results[0];
      if (!hit || !hit.artworkUrl100) return null;
      return { src: upsizeItunesArtwork(hit.artworkUrl100), viewUrl: hit.trackViewUrl || null, source: "itunes" };
    });
  }

  // Every individual network call already has its own timeout (FETCH_TIMEOUT_MS,
  // above), but this is a second, outer safety net: no matter how a lookup
  // gets stuck -- a connection that neither completes nor cleanly errors,
  // some future edge case in a lookup source -- a song's artwork slot must
  // still settle and fall back to the placeholder within a bounded time
  // rather than staying in "still looking" limbo forever.
  var OVERALL_TIMEOUT_MS = 12000;
  function withOverallTimeout(promise) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve(null);
      }, OVERALL_TIMEOUT_MS);
      promise.then(function (v) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(v);
      });
    });
  }

  function resolveArtwork(song) {
    var cached = getCached(song.id);
    if (cached) return Promise.resolve(cached);
    var lookup = lookupCoverArtArchive(song)
      .catch(function () { return null; })
      .then(function (result) {
        if (result) return result;
        return lookupItunes(song).catch(function () { return null; });
      });
    return withOverallTimeout(lookup).then(function (result) {
      var entry = result || { src: null, viewUrl: null, source: "none" };
      setCached(song.id, entry);
      return entry;
    });
  }

  // Wires an <img> + its fallback element to lazily resolve and display
  // artwork for `song` ({id, title, artist}). The fallback stays visible
  // (and is all that ever shows) unless/until a real image is found.
  // onResolved(entry) is called once, with entry.src === null on failure.
  var lazyObserver = null;
  function getLazyObserver() {
    if (lazyObserver) return lazyObserver;
    if (typeof IntersectionObserver === "undefined") return null;
    lazyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          lazyObserver.unobserve(e.target);
          var job = e.target._campfireArtworkJob;
          if (job) job();
        });
      },
      { rootMargin: "400px 0px" }
    );
    return lazyObserver;
  }

  function watch(imgEl, fallbackEl, song, onResolved) {
    if (!imgEl || !song || !song.id) return;
    // Most callers give every song its own permanent <img> (song cards), but
    // the chord viewer reuses a single element across whichever song is
    // currently open. Tagging it with the song id lets a lookup that's still
    // in flight when the user switches songs detect it's stale and no-op
    // instead of painting the wrong song's art over the new one.
    imgEl.dataset.artworkFor = song.id;
    imgEl.classList.remove("is-loaded");
    var run = function () {
      resolveArtwork(song).then(function (entry) {
        if (imgEl.dataset.artworkFor !== song.id) return; // superseded by a later watch() call
        if (entry.src) {
          imgEl.onload = function () { imgEl.classList.add("is-loaded"); };
          imgEl.onerror = function () {
            // a previously-cached URL can occasionally go stale -- fall back
            // to the placeholder rather than showing a broken image
            imgEl.classList.remove("is-loaded");
          };
          imgEl.src = entry.src;
        }
        if (onResolved) onResolved(entry);
      });
    };

    var observer = getLazyObserver();
    if (observer) {
      imgEl._campfireArtworkJob = run;
      observer.observe(imgEl);
    } else {
      run(); // no IntersectionObserver support -- just resolve directly
    }
  }

  window.CampfireArtwork = { watch: watch };
})();
