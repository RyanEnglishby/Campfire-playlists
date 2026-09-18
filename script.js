(function () {
  "use strict";

  var SLEEVE_PALETTES = [
    ["#241014", "#ff8a4c"],
    ["#1c1206", "#e2703a"],
    ["#160f1c", "#caa257"],
    ["#20140a", "#d98a4f"],
    ["#12100e", "#e8b06b"],
    ["#1a0f08", "#ff7a3d"],
    ["#0d0b12", "#c96b3e"],
    ["#191007", "#f0c98a"]
  ];

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function paletteFor(title) {
    return SLEEVE_PALETTES[hashString(title) % SLEEVE_PALETTES.length];
  }

  var FEATURED = {
    title: "Something in the Orange",
    artist: "Zach Bryan",
    year: 2022,
    chords: "Em, D, C, G",
    capo: null,
    tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/something-in-the-orange-chords-4012711",
    spotify: "Something in the Orange Zach Bryan",
    reason: "The one that goes quiet around 1am. Everyone in the circle knows it by the second chorus, and nobody sings it too loud.",
    line: "something in the orange…"
  };

  var FINALE = {
    title: "No Hard Feelings",
    artist: "The Avett Brothers",
    year: 2016,
    mood: "Last Song of the Night",
    chords: "C, Em, Am, F, G",
    capo: "Capo 5",
    tab: "https://tabs.ultimate-guitar.com/tab/the-avett-brothers/no-hard-feelings-chords-1856008",
    spotify: "No Hard Feelings The Avett Brothers",
    reason: "For when the fire is just coals and everyone is half-asleep in their chairs. Nothing left to prove, nothing left to say.",
    line: "no hard feelings…"
  };

  var MAIN = [
    { title: "Revival", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Em, G, C", capo: null, note: "The simplest one on the list — good for warming up the circle.", tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/revival-chords-2907779", spotify: "Revival Zach Bryan" },
    { title: "Oklahoma Smokeshow", artist: "Zach Bryan", year: 2023, mood: "Singalongs", chords: "G, C, Em, D", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/oklahoma-smokeshow-chords-4272574", spotify: "Oklahoma Smokeshow Zach Bryan" },
    { title: "East Side of Sorrow", artist: "Zach Bryan", year: 2023, mood: "Nostalgia", chords: "G, C, D, Em", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/east-side-of-sorrow-chords-4928983", spotify: "East Side of Sorrow Zach Bryan" },
    { title: "Wagon Wheel", artist: "Old Crow Medicine Show", year: 2004, mood: "Singalongs", chords: "G, D, Em, C", capo: "Capo 2", note: "Same shapes as the no-capo version, minus the hard F#m.", tab: "https://tabs.ultimate-guitar.com/tab/darius-rucker/wagon-wheel-chords-1215756", spotify: "Wagon Wheel Old Crow Medicine Show" },
    { title: "Wonderwall", artist: "Oasis", year: 1995, mood: "Nostalgia", chords: "Am, C, D, Em, G", capo: "Capo 2", note: "No barre chords in this version.", tab: "https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596", spotify: "Wonderwall Oasis" },
    { title: "Take Me Home, Country Roads", artist: "John Denver", year: 1971, mood: "Singalongs", chords: "G, D, Em, C", capo: "Capo 2", note: "About as classic a campfire singalong as it gets.", tab: "https://tabs.ultimate-guitar.com/tab/john-denver/take-me-home-country-roads-chords-57606", spotify: "Take Me Home Country Roads John Denver" },
    { title: "Brown Eyed Girl", artist: "Van Morrison", year: 1967, mood: "Singalongs", chords: "G, C, D", capo: null, note: "Only three chords, and everyone knows the “sha la la” part.", tab: "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-chords-819644", spotify: "Brown Eyed Girl Van Morrison" },
    { title: "Ripple", artist: "Grateful Dead", year: 1970, mood: "Acoustic", chords: "G, C, D, Am, A7", capo: null, note: "A7 is a bonus chord — even easier than F.", tab: "https://tabs.ultimate-guitar.com/tab/grateful-dead/ripple-chords-462863", spotify: "Ripple Grateful Dead" },
    { title: "Heading South", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Am, G, F, C", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/heading-south-chords-2825888", spotify: "Heading South Zach Bryan" },
    { title: "I Remember Everything", artist: "Zach Bryan feat. Kacey Musgraves", year: 2023, mood: "Nostalgia", chords: "Am, F, G", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/i-remember-everything-chords-4928905", spotify: "I Remember Everything Zach Bryan Kacey Musgraves" },
    { title: "From Austin", artist: "Zach Bryan", year: 2023, mood: "Late Nights", chords: "C, G, Am, F", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/from-austin-chords-4099420", spotify: "From Austin Zach Bryan" },
    { title: "Sun to Me", artist: "Zach Bryan", year: 2023, mood: "Acoustic", chords: "C, G, Am, F", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/sun-to-me-chords-4200208", spotify: "Sun to Me Zach Bryan" },
    { title: "Condemned", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Am, G, F, C", capo: null, note: null, tab: "https://tabs.ultimate-guitar.com/tab/zach-bryan/condemned-chords-2810099", spotify: "Condemned Zach Bryan" },
    { title: "Ho Hey", artist: "The Lumineers", year: 2012, mood: "Singalongs", chords: "F, C, Am, G", capo: null, note: "Everyone knows the “ho!” and “hey!” parts.", tab: "https://tabs.ultimate-guitar.com/tab/the-lumineers/ho-hey-chords-1047662", spotify: "Ho Hey The Lumineers" },
    { title: "I'm Yours", artist: "Jason Mraz", year: 2008, mood: "Singalongs", chords: "C, G, Am, F", capo: null, note: "Same four chords as the Zach Bryan songs, different feel entirely.", tab: "https://tabs.ultimate-guitar.com/tab/jason-mraz/im-yours-chords-468625", spotify: "I'm Yours Jason Mraz" },
    { title: "The Boxer", artist: "Simon & Garfunkel", year: 1970, mood: "Acoustic", chords: "C, Am, G, F", capo: null, note: "The “lie-la-lie” chorus is an easy group singalong.", tab: "https://tabs.ultimate-guitar.com/tab/simon-garfunkel/the-boxer-chords-83970", spotify: "The Boxer Simon and Garfunkel" }
  ];

  var DYING = [
    { title: "Angel from Montgomery", artist: "John Prine", year: 1971, mood: "Nostalgia", chords: "G, C, D7, F", capo: null, note: "Covered by everyone from Bonnie Raitt to John Mayer.", tab: "https://tabs.ultimate-guitar.com/tab/john-prine/angel-from-montgomery-chords-604233", spotify: "Angel from Montgomery John Prine" },
    { title: "Society", artist: "Eddie Vedder", year: 2007, mood: "Acoustic", chords: "Am, C, G, F", capo: "Capo 2", note: "From the Into the Wild soundtrack — built for exactly this setting.", tab: "https://tabs.ultimate-guitar.com/tab/eddie-vedder/society-chords-984278", spotify: "Society Eddie Vedder" }
  ];

  var ALL_SONGS = MAIN.concat(DYING, [FEATURED, FINALE]);
  var STORAGE_KEY = "campfire-songs-heard";

  function loadHeard() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveHeard(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var heard = loadHeard();

  function spotifyIcon() {
    var wrap = document.createElement("span");
    wrap.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.72-.66 13.439 1.62.361.181.54.78.302 1.201zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38C8.76 5.939 15.9 6.24 20.281 8.82c.539.301.719 1.021.42 1.561-.3.421-1.02.599-1.62.3z"/></svg>';
    return wrap.firstChild;
  }

  function makeHeardToggle(song, onUpdate) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "heard-toggle" + (heard[song.title] ? " is-heard" : "");
    btn.title = "Mark as heard around the fire";
    btn.setAttribute("aria-pressed", heard[song.title] ? "true" : "false");
    btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-flame"></use></svg>';
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      heard[song.title] = !heard[song.title];
      btn.classList.toggle("is-heard", !!heard[song.title]);
      btn.setAttribute("aria-pressed", heard[song.title] ? "true" : "false");
      saveHeard(heard);
      updateProgress();
      if (onUpdate) onUpdate();
    });
    return btn;
  }

  function buildSongCard(song, index) {
    var card = document.createElement("article");
    card.className = "song-card reveal";
    card.dataset.mood = song.mood;
    card.style.setProperty("--reveal-delay", Math.min(index * 55, 400) + "ms");

    var palette = paletteFor(song.title);
    card.style.setProperty("--hue-a", palette[0]);
    card.style.setProperty("--hue-b", palette[1]);

    var cover = document.createElement("div");
    cover.className = "cover";
    var letter = document.createElement("span");
    letter.className = "cover-letter";
    letter.textContent = song.title.charAt(0);
    cover.appendChild(letter);

    var body = document.createElement("div");
    body.className = "song-body";

    var topRow = document.createElement("div");
    topRow.className = "song-top-row";
    var titleEl = document.createElement("h3");
    titleEl.className = "song-title";
    titleEl.textContent = song.title;
    var yearEl = document.createElement("span");
    yearEl.className = "song-year";
    yearEl.textContent = song.year;
    topRow.appendChild(titleEl);
    topRow.appendChild(yearEl);

    var artistEl = document.createElement("p");
    artistEl.className = "song-artist";
    artistEl.textContent = song.artist;

    var tags = document.createElement("div");
    tags.className = "song-tags";
    var moodTag = document.createElement("span");
    moodTag.className = "tag mood";
    moodTag.textContent = song.mood;
    tags.appendChild(moodTag);
    if (song.capo) {
      var capoTag = document.createElement("span");
      capoTag.className = "tag";
      capoTag.textContent = song.capo;
      tags.appendChild(capoTag);
    }

    var detail = document.createElement("p");
    detail.className = "song-detail";
    detail.textContent = "Played on " + song.chords + (song.note ? " — " + song.note : "") + " ";
    if (song.tab) {
      var tabLink = document.createElement("a");
      tabLink.href = song.tab;
      tabLink.target = "_blank";
      tabLink.rel = "noopener noreferrer";
      tabLink.textContent = "chord chart ↗";
      tabLink.addEventListener("click", function (e) { e.stopPropagation(); });
      detail.appendChild(tabLink);
    }

    body.appendChild(topRow);
    body.appendChild(artistEl);
    body.appendChild(tags);
    body.appendChild(detail);

    var heardBtn = makeHeardToggle(song);

    var playBtn = document.createElement("a");
    playBtn.className = "play-btn";
    playBtn.href = "https://open.spotify.com/search/" + encodeURIComponent(song.spotify);
    playBtn.target = "_blank";
    playBtn.rel = "noopener noreferrer";
    playBtn.title = "Find “" + song.title + "” on Spotify";
    playBtn.addEventListener("click", function (e) { e.stopPropagation(); });
    playBtn.appendChild(spotifyIcon());

    card.appendChild(cover);
    card.appendChild(body);
    card.appendChild(heardBtn);
    card.appendChild(playBtn);

    card.addEventListener("click", function () {
      card.classList.toggle("is-expanded");
    });

    return card;
  }

  function buildFeatureCard(container, song) {
    var palette = paletteFor(song.title);
    var frame = document.createElement("div");
    frame.className = "record-frame";
    frame.style.setProperty("--sleeve-a", palette[0]);
    frame.style.setProperty("--sleeve-b", palette[1]);

    var vinyl = document.createElement("div");
    vinyl.className = "vinyl";
    var sleeve = document.createElement("div");
    sleeve.className = "sleeve";
    var sleeveLetter = document.createElement("span");
    sleeveLetter.textContent = song.title.charAt(0);
    sleeve.appendChild(sleeveLetter);
    frame.appendChild(vinyl);
    frame.appendChild(sleeve);

    var info = document.createElement("div");
    info.className = "featured-info";

    var h = document.createElement("h2");
    h.textContent = song.title;

    var artist = document.createElement("p");
    artist.className = "featured-artist";
    artist.textContent = song.artist + " · " + song.year;

    var reason = document.createElement("p");
    reason.className = "featured-reason";
    reason.textContent = song.reason;

    var line = document.createElement("p");
    line.className = "featured-line";
    line.textContent = "“" + song.line + "”";

    var actions = document.createElement("div");
    actions.className = "featured-actions";

    var link = document.createElement("a");
    link.className = "spotify-link";
    link.href = "https://open.spotify.com/search/" + encodeURIComponent(song.spotify);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.appendChild(spotifyIcon());
    link.appendChild(document.createTextNode("Open in Spotify"));

    var heardBtn = makeHeardToggle(song);

    actions.appendChild(link);
    actions.appendChild(heardBtn);

    info.appendChild(h);
    info.appendChild(artist);
    info.appendChild(reason);
    info.appendChild(line);
    info.appendChild(actions);

    container.appendChild(frame);
    container.appendChild(info);
  }

  function updateProgress() {
    var count = ALL_SONGS.filter(function (s) { return heard[s.title]; }).length;
    var fill = document.getElementById("progress-fill");
    var text = document.getElementById("progress-text");
    if (fill) fill.style.width = (count / ALL_SONGS.length * 100) + "%";
    if (text) text.textContent = count + " of " + ALL_SONGS.length + " heard";
  }

  function renderAll() {
    var mainList = document.getElementById("list-main");
    var dyingList = document.getElementById("list-dying");
    MAIN.forEach(function (song, i) { mainList.appendChild(buildSongCard(song, i)); });
    DYING.forEach(function (song, i) { dyingList.appendChild(buildSongCard(song, i)); });

    buildFeatureCard(document.getElementById("featured-card"), FEATURED);
    buildFeatureCard(document.getElementById("finale-card"), FINALE);

    updateProgress();
  }

  function initCategories() {
    var pills = document.querySelectorAll(".pill-filter");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var mood = pill.dataset.mood;
        document.querySelectorAll("#list-main .song-card").forEach(function (card) {
          var show = mood === "all" || card.dataset.mood === mood;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  function initShuffle() {
    var btn = document.getElementById("shuffle-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var pills = document.querySelectorAll(".pill-filter");
      pills.forEach(function (p) { p.classList.remove("is-active"); });
      var allPill = document.querySelector('.pill-filter[data-mood="all"]');
      if (allPill) allPill.classList.add("is-active");
      document.querySelectorAll("#list-main .song-card").forEach(function (card) {
        card.classList.remove("is-hidden");
      });

      var cards = document.querySelectorAll("#list-main .song-card, #list-dying .song-card");
      if (!cards.length) return;
      var pick = cards[Math.floor(Math.random() * cards.length)];
      pick.scrollIntoView({ behavior: "smooth", block: "center" });
      pick.classList.remove("is-shuffled");
      void pick.offsetWidth;
      pick.classList.add("is-shuffled");
      window.setTimeout(function () { pick.classList.remove("is-shuffled"); }, 1900);
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initEmbers() {
    var embersEl = document.getElementById("embers");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!embersEl || reduceMotion) return;
    var count = window.innerWidth < 640 ? 7 : 16;
    for (var i = 0; i < count; i++) {
      var span = document.createElement("span");
      span.className = "ember";
      var xPct = 42 + Math.random() * 16;
      var size = 2.5 + Math.random() * 3;
      var dur = 4 + Math.random() * 4;
      var delay = Math.random() * 6;
      var drift = (Math.random() * 60 - 30).toFixed(0) + "px";
      span.style.setProperty("--x", xPct + "%");
      span.style.setProperty("--size", size.toFixed(1) + "px");
      span.style.setProperty("--dur", dur.toFixed(2) + "s");
      span.style.setProperty("--delay", delay.toFixed(2) + "s");
      span.style.setProperty("--drift", drift);
      embersEl.appendChild(span);
    }
  }

  function initStarParallax() {
    var stars = document.getElementById("stars");
    if (!stars) return;
    var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduceMotion) return;
    window.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 14;
      var y = (e.clientY / window.innerHeight - 0.5) * 14;
      stars.style.transform = "translate(" + x + "px, " + y + "px)";
    }, { passive: true });
  }

  function initEmbersLowOnFooter() {
    var footer = document.querySelector(".closing");
    if (!footer || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        document.body.classList.toggle("embers-low", entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    io.observe(footer);
  }

  /* ---------- campfire crackle audio (synthesised, no audio file needed) ---------- */
  var audioCtx = null;
  var audioNodes = null;
  var crackleTimer = null;
  var soundOn = false;

  function makeNoiseBuffer(ctx) {
    var bufferSize = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  function scheduleCrackle(ctx, buffer, destination) {
    if (!soundOn) return;
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var offset = Math.random() * (buffer.duration - 0.2);

    var bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 900 + Math.random() * 2200;
    bandpass.Q.value = 1.2;

    var gain = ctx.createGain();
    var peak = 0.07 + Math.random() * 0.15;
    var now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08 + Math.random() * 0.1);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(destination);
    source.start(now, offset, 0.2);

    crackleTimer = window.setTimeout(function () {
      scheduleCrackle(ctx, buffer, destination);
    }, 150 + Math.random() * 500);
  }

  function startFireSound() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var buffer = makeNoiseBuffer(audioCtx);

      var bedSource = audioCtx.createBufferSource();
      bedSource.buffer = buffer;
      bedSource.loop = true;
      var bedFilter = audioCtx.createBiquadFilter();
      bedFilter.type = "lowpass";
      bedFilter.frequency.value = 550;
      var bedGain = audioCtx.createGain();
      bedGain.gain.value = 0.05;
      var masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.5;

      bedSource.connect(bedFilter);
      bedFilter.connect(bedGain);
      bedGain.connect(masterGain);
      masterGain.connect(audioCtx.destination);
      bedSource.start();

      audioNodes = { bedSource: bedSource };
      soundOn = true;
      scheduleCrackle(audioCtx, buffer, masterGain);
      return true;
    } catch (e) {
      return false;
    }
  }

  function stopFireSound() {
    soundOn = false;
    if (crackleTimer) { window.clearTimeout(crackleTimer); crackleTimer = null; }
    if (audioNodes) {
      try { audioNodes.bedSource.stop(); } catch (e) {}
      audioNodes = null;
    }
  }

  function initSoundToggle() {
    var btn = document.getElementById("sound-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!soundOn) {
        var ok = startFireSound();
        if (ok) {
          btn.setAttribute("aria-pressed", "true");
        }
      } else {
        stopFireSound();
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    initCategories();
    initShuffle();
    initReveal();
    initEmbers();
    initStarParallax();
    initEmbersLowOnFooter();
    initSoundToggle();
  });
})();
