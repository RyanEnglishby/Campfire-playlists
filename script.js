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

  function tiltFor(title, range, seedOffset) {
    var h = hashString(title + (seedOffset || ""));
    return (((h % 200) - 100) / 100 * range).toFixed(2);
  }

  var FEATURED = {
    title: "Something in the Orange",
    artist: "Zach Bryan",
    year: 2022,
    chords: "Em, D, C, G",
    capo: null,
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
    spotify: "No Hard Feelings The Avett Brothers",
    reason: "For when the fire is just coals and everyone is half-asleep in their chairs. Nothing left to prove, nothing left to say.",
    line: "no hard feelings…"
  };

  var MAIN = [
    { title: "Revival", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Em, G, C", capo: null, note: "The simplest one on the list.", spotify: "Revival Zach Bryan", margin: "first one I ever learned" },
    { title: "Oklahoma Smokeshow", artist: "Zach Bryan", year: 2023, mood: "Singalongs", chords: "G, C, Em, D", capo: null, note: null, spotify: "Oklahoma Smokeshow Zach Bryan" },
    { title: "East Side of Sorrow", artist: "Zach Bryan", year: 2023, mood: "Nostalgia", chords: "G, C, D, Em", capo: null, note: null, spotify: "East Side of Sorrow Zach Bryan" },
    { title: "Wagon Wheel", artist: "Old Crow Medicine Show", year: 2004, mood: "Singalongs", chords: "G, D, Em, C", capo: "Capo 2", note: "Same shapes as the no-capo version, minus the hard F#m.", spotify: "Wagon Wheel Old Crow Medicine Show", pick: true, margin: "everyone knows it by the second line" },
    { title: "Wonderwall", artist: "Oasis", year: 1995, mood: "Nostalgia", chords: "Am, C, D, Em, G", capo: "Capo 2", note: "No barre chords in this version.", spotify: "Wonderwall Oasis" },
    { title: "Take Me Home, Country Roads", artist: "John Denver", year: 1971, mood: "Singalongs", chords: "G, D, Em, C", capo: "Capo 2", note: "About as classic a campfire singalong as it gets.", spotify: "Take Me Home Country Roads John Denver" },
    { title: "Brown Eyed Girl", artist: "Van Morrison", year: 1967, mood: "Singalongs", chords: "G, C, D", capo: null, note: "Only three chords, and everyone knows the “sha la la” part.", spotify: "Brown Eyed Girl Van Morrison" },
    { title: "Ripple", artist: "Grateful Dead", year: 1970, mood: "Acoustic", chords: "G, C, D, Am, A7", capo: null, note: "A7 is a bonus chord — even easier than F.", spotify: "Ripple Grateful Dead" },
    { title: "Heading South", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Am, G, F, C", capo: null, note: null, spotify: "Heading South Zach Bryan" },
    { title: "I Remember Everything", artist: "Zach Bryan feat. Kacey Musgraves", year: 2023, mood: "Nostalgia", chords: "Am, F, G", capo: null, note: null, spotify: "I Remember Everything Zach Bryan Kacey Musgraves", pick: true, margin: "capo 2 — nobody double-checks" },
    { title: "From Austin", artist: "Zach Bryan", year: 2023, mood: "Late Nights", chords: "C, G, Am, F", capo: null, note: null, spotify: "From Austin Zach Bryan" },
    { title: "Sun to Me", artist: "Zach Bryan", year: 2023, mood: "Acoustic", chords: "C, G, Am, F", capo: null, note: null, spotify: "Sun to Me Zach Bryan" },
    { title: "Condemned", artist: "Zach Bryan", year: 2022, mood: "Late Nights", chords: "Am, G, F, C", capo: null, note: null, spotify: "Condemned Zach Bryan" },
    { title: "Ho Hey", artist: "The Lumineers", year: 2012, mood: "Singalongs", chords: "F, C, Am, G", capo: null, note: "Everyone knows the “ho!” and “hey!” parts.", spotify: "Ho Hey The Lumineers", pick: true, margin: "the whole car sings this part" },
    { title: "I'm Yours", artist: "Jason Mraz", year: 2008, mood: "Singalongs", chords: "C, G, Am, F", capo: null, note: "Same four chords as the Zach Bryan songs, different feel entirely.", spotify: "I'm Yours Jason Mraz" },
    { title: "The Boxer", artist: "Simon & Garfunkel", year: 1970, mood: "Acoustic", chords: "C, Am, G, F", capo: null, note: "The “lie-la-lie” chorus is an easy group singalong.", spotify: "The Boxer Simon and Garfunkel" }
  ];

  var DYING = [
    { title: "Angel from Montgomery", artist: "John Prine", year: 1971, mood: "Nostalgia", chords: "G, C, D7, F", capo: null, note: "Covered by everyone from Bonnie Raitt to John Mayer.", spotify: "Angel from Montgomery John Prine" },
    { title: "Society", artist: "Eddie Vedder", year: 2007, mood: "Acoustic", chords: "Am, C, G, F", capo: "Capo 2", note: "From the Into the Wild soundtrack.", spotify: "Society Eddie Vedder", margin: "play this one quiet" }
  ];

  var ALL_SONGS = MAIN.concat(DYING, [FEATURED, FINALE]);
  var STORAGE_KEY = "campfire-songs-heard";

  /* ---------- chord data: one reusable object per song ----------
     Only fields already established elsewhere on this site (title,
     artist, year, capo, the flat chord palette, favorite status) are
     carried over. Section-by-section progressions are intentionally
     left empty — nobody has verified real chord-sheet data for these
     20 songs inside this project, and guessing at a specific song's
     arrangement from general familiarity is not the same as reliable
     data. Fill `progression` arrays in by hand when you have a real
     source; the viewer already renders a clear "not written down
     yet" state for anything left empty. */
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* ---------- chord + lyric data ----------
     One play-along sheet per song: metadata, a strumming pattern, and
     an ordered list of sections. A section is either instrumental
     (Intro/Outro/Break/Interlude — shown as a chord-and-strum row) or
     a lyric section (Verse/Chorus/Bridge/Pre-Chorus). No lyrics have
     been supplied yet for any song, so every lyric section's `lines`
     stays empty and renders an honest "lyrics not added yet" note
     next to its chords — never invented or fetched. `beats` assumes
     plain 4/4 time, not a claim about the original recording.

     Playback timing is driven by real musical time, not by scroll
     position or an estimated duration. Each song carries two tempos:
     referenceBpm (the measured tempo of the actual recording — stored
     for reference only, never used for playback) and playAlongBpm
     (the pulse the highlighting/scroll/count-in engine actually runs
     on, which is deliberately slower than referenceBpm for songs that
     are more comfortable practiced at half-time). The engine must
     only ever read playAlongBpm. DEFAULT_BPM is a defensive fallback
     for a missing value, not a value any song is meant to use. */
  var INSTRUMENTAL_SECTION_NAMES = { "Intro": true, "Outro": true, "Break": true, "Interlude": true };
  var DEFAULT_STRUM = "↓ ↓↑ ↑↓↑";
  var DEFAULT_STRUM_EASY = "↓ ↓ ↓ ↓";
  var DEFAULT_BPM = 90;

  // Plain string -> defaults to a full 4/4 bar (beats: 4). Pass ch(chord,
  // beats) instead when a specific chord holds for something other than
  // one full bar (a passing chord, a two-bar hold, a split bar, etc).
  function ch(chord, beats) { return { chord: chord, beats: beats }; }

  function makeSection(name, chords, repeatCount) {
    return {
      name: name,
      repeatCount: repeatCount || 1,
      instrumental: !!INSTRUMENTAL_SECTION_NAMES[name],
      progression: chords.map(function (c) {
        return typeof c === "string" ? { chord: c, beats: 4 } : c;
      }),
      lines: []
    };
  }

  function makeSong(fields) {
    fields.timeSignature = fields.timeSignature || "4/4";
    fields.countInBars = fields.countInBars != null ? fields.countInBars : 1;
    fields.strummingPattern = fields.strummingPattern || DEFAULT_STRUM;
    fields.easyStrummingPattern = fields.easyStrummingPattern || DEFAULT_STRUM_EASY;
    fields.tuning = fields.tuning || "Standard";
    return fields;
  }

  var CHORD_SONGS = {
    "wagon-wheel": makeSong({
      difficulty: "Easy", capo: "Capo 2",
      referenceBpm: 146, playAlongBpm: 73, timeSignature: "4/4",
      // The chorus's final C is one held chord across two bars (8 beats),
      // not two separate 4-beat C's.
      sections: [
        makeSection("Verse 1", ["G", "D", "Em", "C"]),
        makeSection("Verse 2", ["G", "D", "Em", "C"]),
        makeSection("Chorus", ["G", "D", ch("C", 8)]),
        makeSection("Verse 3", ["G", "D", "Em", "C"]),
        makeSection("Chorus", ["G", "D", ch("C", 8)]),
        makeSection("Outro", [])
      ]
    }),
    "something-in-the-orange": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 175, playAlongBpm: 88, timeSignature: "3/4",
      // 3/4 time: every chord here is one complete bar = 3 beats, not 4.
      sections: [
        makeSection("Intro", [ch("Em7", 3), ch("D/F#", 3), ch("G", 3), ch("D/F#", 3), ch("Em7", 3)]),
        makeSection("Verse", [ch("Em7", 3), ch("D/F#", 3), ch("G", 3), ch("D/F#", 3), ch("Em7", 3)]),
        makeSection("Chorus", [ch("Cadd9", 3), ch("G", 3), ch("D", 3), ch("Em7", 3)]),
        makeSection("Outro", [ch("Cadd9", 3), ch("G", 3), ch("D", 3), ch("Em7", 3)])
      ]
    }),
    "revival": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 158, playAlongBpm: 79, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["Em", "G", "C", "G"]),
        makeSection("Verse", ["Em", "G", "C", "G"]),
        makeSection("Chorus", ["Em", "G", "C", "G"]),
        makeSection("Interlude", ["Em", "G", "C", "G"]),
        makeSection("Outro", ["Em", "G", "C", "G"])
      ]
    }),
    "oklahoma-smokeshow": makeSong({
      difficulty: "Easy", capo: "Capo 1",
      referenceBpm: 123, playAlongBpm: 123, timeSignature: "4/4",
      // Long chord holds: tonic/IV get a double bar (8 beats), minor/V get
      // one bar (4 beats), by harmonic role — not a flat loop.
      sections: [
        makeSection("Intro", [ch("G", 8), ch("C", 8), ch("Em", 4), ch("D", 4)]),
        makeSection("Verse", [ch("G", 8), ch("C", 8), ch("Em", 4), ch("D", 4), ch("G", 8)]),
        makeSection("Chorus", [ch("C", 8), ch("G", 8), ch("D", 4), ch("Em", 4)]),
        makeSection("Break", [ch("C", 8), ch("G", 8), ch("D", 4), ch("Em", 4)]),
        makeSection("Outro", [ch("C", 8), ch("G", 8), ch("D", 4), ch("Em", 4)])
      ]
    }),
    "east-side-of-sorrow": makeSong({
      difficulty: "Easy", capo: "Capo 2",
      referenceBpm: 144, playAlongBpm: 72, timeSignature: "4/4",
      sections: [
        makeSection("Verse", ["G", "C", "G", "D", "G", "C", "G", "D", "G", "C", "D"]),
        makeSection("Chorus", ["C", "G", "D", "G", "C", "G", "D", "G", "C", "D", "G"]),
        makeSection("Bridge", ["C", "G", "D", "G"]),
        makeSection("Outro", ["G", "C", "G", "D", "G", "C", "D"])
      ]
    }),
    "wonderwall": makeSong({
      difficulty: "Easy / Medium", capo: "Capo 2",
      referenceBpm: 175, playAlongBpm: 88, timeSignature: "4/4",
      sections: [
        makeSection("Verse", ["Em7", "G", "Dsus4", "A7sus4"]),
        makeSection("Pre-Chorus", ["Cadd9", "Dsus4", "Em7"]),
        makeSection("Chorus", ["Cadd9", "Em7", "G", "Em7"])
      ]
    }),
    "take-me-home-country-roads": makeSong({
      difficulty: "Easy", capo: "Capo 2",
      referenceBpm: 82, playAlongBpm: 82, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["G"]),
        makeSection("Verse", ["G", "Em", "D", "C", "G"]),
        makeSection("Chorus", ["G", "D", "Em", "C", "G", "D", "C", "G"]),
        makeSection("Bridge", ["Em", "D/F#", "G", "C", "G", "D", "Em", "F", "C", "G", "D", "D7"]),
        makeSection("Outro", ["D", "G"])
      ]
    }),
    "brown-eyed-girl": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 151, playAlongBpm: 76, timeSignature: "4/4",
      // Pre-Chorus's C-D-G turnaround (both times it occurs) is a quick
      // C/D split within the bar before G lands on the full bar.
      sections: [
        makeSection("Intro", ["G", "C", "G", "D"]),
        makeSection("Verse", ["G", "C", "G", "D"]),
        makeSection("Pre-Chorus", [ch("C", 2), ch("D", 2), ch("G", 4), "Em", ch("C", 2), ch("D", 2), ch("G", 4), "D7"]),
        makeSection("Chorus", ["G", "D", "C", "G", "Em", "C", "D"]),
        makeSection("Outro", ["G", "C", "G", "D"])
      ]
    }),
    "ripple": makeSong({
      difficulty: "Easy / Medium", capo: null,
      referenceBpm: 126, playAlongBpm: 126, timeSignature: "4/4",
      sections: [
        makeSection("Verse", ["G", "C", "G", "C", "G", "D"]),
        makeSection("Chorus", ["C", "G", "Am", "C", "G", "D", "C", "G"]),
        makeSection("Outro", ["G", "C", "G", "D", "G"])
      ]
    }),
    "heading-south": makeSong({
      difficulty: "Easy", capo: "Capo 4",
      referenceBpm: 110, playAlongBpm: 110, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["C", "G", "Am", "F"]),
        makeSection("Verse", ["Am", "F", "C", "G"]),
        makeSection("Chorus", ["Am", "F", "C", "G"]),
        makeSection("Outro", ["Am", "F", "C", "G"])
      ]
    }),
    "i-remember-everything": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 78, playAlongBpm: 78, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["Am", "C", "G", "Am", "C", "G"]),
        makeSection("Verse", ["Am", "C", "G"]),
        makeSection("Chorus", ["F", "C", "G", "Am"])
      ]
    }),
    "from-austin": makeSong({
      difficulty: "Medium", capo: null,
      referenceBpm: 110, playAlongBpm: 110, timeSignature: "4/4",
      sections: [
        makeSection("Verse", ["G", "C", "Em", "D"]),
        makeSection("Chorus", ["C", "G", "D", "Em"]),
        makeSection("Outro", ["G", "C", "Em", "D"])
      ]
    }),
    "sun-to-me": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 88, playAlongBpm: 88, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["Am", "G", "C", "F"]),
        makeSection("Verse", ["Am", "G", "C", "F"]),
        makeSection("Chorus", ["F", "C", "G", "Am"]),
        makeSection("Outro", ["Am", "G", "C", "F"])
      ]
    }),
    "condemned": makeSong({
      difficulty: "Medium", capo: "Capo 1",
      referenceBpm: 126, playAlongBpm: 63, timeSignature: "4/4",
      sections: [
        makeSection("Verse", ["Am", "E", "Bm", "C#m"]),
        makeSection("Pre-Chorus", ["Am", "E", "Bm", "C#m"]),
        makeSection("Chorus", ["Am", "E", "Bm", "C#m"])
      ]
    }),
    "ho-hey": makeSong({
      difficulty: "Easy", capo: null,
      referenceBpm: 80, playAlongBpm: 80, timeSignature: "4/4",
      // The C/F alternation is not an even split: C holds for 3 beats, F
      // gets a quick 1 beat, repeated. Order kept as originally given
      // (C then F) — see commit notes on which chord leads the bar.
      sections: [
        makeSection("Intro", [ch("C", 3), ch("F", 1)]),
        makeSection("Verse", [ch("C", 3), ch("F", 1), ch("C", 3), ch("F", 1), "Am", "G", "C"]),
        makeSection("Chorus", ["Am", "G", "C"]),
        makeSection("Bridge", ["F", "G"]),
        makeSection("Outro", ["Am", "G", "C"])
      ]
    }),
    "i-m-yours": makeSong({
      difficulty: "Easy", capo: "Capo 4",
      referenceBpm: 151, playAlongBpm: 76, timeSignature: "4/4",
      sections: [
        makeSection("Intro", ["G", "D", "Em", "C"]),
        makeSection("Verse", ["G", "D", "Em", "C"]),
        makeSection("Chorus", ["G", "D", "Em", "C"]),
        makeSection("Bridge", ["G", "D", "Em", "D", "C", "A7", "G", "Bm", "Em", "D", "C", "A7"]),
        makeSection("Outro", ["G", "D", "Em", "C"])
      ]
    }),
    "the-boxer": makeSong({
      difficulty: "Medium", capo: null,
      referenceBpm: 93, playAlongBpm: 93, timeSignature: "4/4",
      // Opening tonic is held across two bars before the progression moves.
      sections: [
        makeSection("Verse", [ch("C", 8), "F", "C", "G", "C", "F", "G", "C"]),
        makeSection("Chorus", ["Am", "G", "C"]),
        makeSection("Outro", ["C", "F", "G", "C"])
      ]
    }),
    "angel-from-montgomery": makeSong({
      difficulty: "Easy", capo: "Capo 2",
      referenceBpm: 132, playAlongBpm: 66, timeSignature: "4/4",
      // Chorus's closing C-D-G turnaround lands on a G held for two bars.
      sections: [
        makeSection("Intro", ["G", "C", "G", "C"]),
        makeSection("Verse", ["G", "C", "G", "C", "G", "C", "D", "D7", "G"]),
        makeSection("Chorus", ["G", "C", "G", "G", "C", "D", ch("G", 8)]),
        makeSection("Outro", ["G", "C", "G"])
      ]
    }),
    "society": makeSong({
      difficulty: "Medium", capo: null,
      referenceBpm: 162, playAlongBpm: 81, timeSignature: "4/4",
      // Bm held an extra bar at the end of a phrase (Intro/Verse); the
      // Bridge's leading Bm is a different structural spot, left at 4.
      sections: [
        makeSection("Intro", ["G", ch("Bm", 8)]),
        makeSection("Verse", ["D", "A", "D", "G", "A", ch("Bm", 8)]),
        makeSection("Chorus", ["G", "D", "A", "G"]),
        makeSection("Bridge", ["Bm", "F#m", "G", "D", "A"]),
        makeSection("Outro", ["G", "D", "A", "G"])
      ]
    }),
    "no-hard-feelings": makeSong({
      difficulty: "Medium", capo: "Capo 5",
      referenceBpm: 142, playAlongBpm: 71, timeSignature: "3/4",
      // 3/4 time: a complete bar is 3 beats, not 4.
      sections: [
        makeSection("Intro", [ch("C", 3), ch("Em", 3), ch("Am", 3), ch("F", 3), ch("Em", 3), ch("F", 3), ch("G", 3)]),
        makeSection("Verse", [ch("C", 3), ch("Em", 3), ch("Am", 3), ch("F", 3), ch("Em", 3), ch("F", 3), ch("G", 3)]),
        makeSection("Chorus", [ch("F", 3), ch("G", 3), ch("F", 3), ch("G", 3), ch("Am", 3), ch("Em", 3), ch("F", 3)]),
        makeSection("Outro", [ch("C", 3), ch("Em", 3), ch("Am", 3), ch("F", 3), ch("G", 3), ch("C", 3)])
      ]
    })
  };

  function toChordEntry(song, category) {
    var id = slugify(song.title);
    var data = CHORD_SONGS[id];
    if (!data) return null;
    return {
      id: id,
      title: song.title,
      artist: song.artist,
      year: song.year,
      category: category,
      difficulty: data.difficulty,
      capo: data.capo,
      tuning: data.tuning,
      strummingPattern: data.strummingPattern,
      easyStrummingPattern: data.easyStrummingPattern,
      referenceBpm: data.referenceBpm,
      playAlongBpm: data.playAlongBpm,
      timeSignature: data.timeSignature,
      countInBars: data.countInBars,
      sections: data.sections
    };
  }

  var CHORD_DATA = [toChordEntry(FEATURED, "Featured Tonight")]
    .concat(MAIN.map(function (s) { return toChordEntry(s, "Around the Fire"); }))
    .concat(DYING.map(function (s) { return toChordEntry(s, "When the Fire's Dying"); }))
    .concat([toChordEntry(FINALE, "Closing Song")])
    .filter(Boolean);

  ALL_SONGS.forEach(function (song) { song.id = slugify(song.title); });

  var CHORD_DATA_BY_ID = {};
  CHORD_DATA.forEach(function (entry) { CHORD_DATA_BY_ID[entry.id] = entry; });

  /* ---------- internal chord viewer ---------- */
  // Discrete speed steps rather than a continuous multiplier, so Faster/
  // Slower always land on one of these exact, clearly-labeled values.
  var SPEED_STEPS = [0.6, 0.75, 0.9, 1.0, 1.15, 1.3, 1.5];
  var SPEED_LABELS = ["0.6x", "0.75x", "0.9x", "1.0x", "1.15x", "1.3x", "1.5x"];
  var DEFAULT_SPEED_INDEX = 3; // 1.0x
  var AUTOSCROLL_TOP_MARGIN = 24; // px of breathing room above the active row so it's never flush against the top edge

  // Listeners for "a song finished playing on its own" -- distinct from a
  // manual pause, which never fires this. Campfire Groups uses it to
  // auto-advance in Random/Vote modes; nothing else currently listens.
  var endedListeners = [];
  function fireEnded() {
    endedListeners.slice().forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
  }

  var chordViewerState = {
    currentId: null,
    speedIndex: DEFAULT_SPEED_INDEX,
    autoScrollOn: false,
    autoScrollRaf: null,
    lastFrameTime: null,
    lastFocused: null,
    // Playback clock: currentTime (seconds since the count-in ended) is the
    // single source of truth. Both the highlighted chord and the scroll
    // position are pure functions of currentTime against the song's real
    // bpm-derived timeline — scroll follows the timeline, it never drives it.
    currentTime: 0,
    timeline: null,
    activeTimelineIndex: -1,
    countInActive: false,
    countInTimer: null
  };

  function chordViewerEls() {
    return {
      root: document.getElementById("chord-viewer"),
      sheet: document.getElementById("chord-sheet"),
      body: document.getElementById("chord-sheet-body"),
      title: document.getElementById("chord-title"),
      meta: document.getElementById("chord-meta"),
      badges: document.getElementById("chord-badges"),
      strumRow: document.getElementById("chord-strum-row"),
      sections: document.getElementById("chord-sections"),
      playBtn: document.getElementById("chord-play-toggle"),
      playLabel: document.getElementById("chord-play-label"),
      speedDisplay: document.getElementById("chord-speed-display")
    };
  }

  function addBadge(container, text) {
    var span = document.createElement("span");
    span.className = "chord-badge";
    span.textContent = text;
    container.appendChild(span);
  }

  function renderStrumItem(container, label, pattern) {
    var item = document.createElement("div");
    item.className = "chord-strum-item";
    var lbl = document.createElement("span");
    lbl.className = "chord-strum-label";
    lbl.textContent = label;
    var pat = document.createElement("span");
    pat.className = "chord-strum-pattern";
    pat.textContent = pattern;
    item.appendChild(lbl);
    item.appendChild(pat);
    container.appendChild(item);
  }

  function renderLyricLine(line) {
    var p = document.createElement("p");
    p.className = "chord-line";
    var text = line.lyrics || "";
    var chords = (line.chords || []).slice().sort(function (a, b) { return a.position - b.position; });

    if (!chords.length) {
      p.textContent = text;
      return { el: p, chordEls: [] };
    }
    if (chords[0].position > 0) {
      var lead = document.createElement("span");
      lead.className = "chord-chunk chord-chunk-plain";
      lead.textContent = text.slice(0, chords[0].position);
      p.appendChild(lead);
    }
    var chunkEls = [];
    chords.forEach(function (c, i) {
      var end = (i + 1 < chords.length) ? chords[i + 1].position : text.length;
      var chunk = document.createElement("span");
      chunk.className = "chord-chunk";
      var over = document.createElement("span");
      over.className = "chord-chunk-chord";
      over.textContent = c.chord;
      var lyric = document.createElement("span");
      lyric.className = "chord-chunk-lyric";
      lyric.textContent = text.slice(c.position, end);
      chunk.appendChild(over);
      chunk.appendChild(lyric);
      p.appendChild(chunk);
      chunkEls.push(chunk);
    });
    return { el: p, chordEls: chunkEls };
  }

  function renderChordSheet() {
    var entry = CHORD_DATA_BY_ID[chordViewerState.currentId];
    if (!entry) return;
    var els = chordViewerEls();

    els.title.textContent = entry.title;
    els.meta.textContent = entry.artist + " · " + entry.year;

    els.badges.innerHTML = "";
    addBadge(els.badges, entry.difficulty);
    addBadge(els.badges, "Capo " + (entry.capo ? entry.capo.replace(/^Capo\s*/i, "") : "none"));
    addBadge(els.badges, entry.tuning + " tuning");

    els.strumRow.innerHTML = "";
    renderStrumItem(els.strumRow, "Strumming", entry.strummingPattern);
    renderStrumItem(els.strumRow, "Easy", entry.easyStrummingPattern);

    els.sections.innerHTML = "";
    var sectionBuilds = [];
    entry.sections.forEach(function (section) {
      var block = document.createElement("div");
      block.className = "chord-section";

      var name = document.createElement("h4");
      name.className = "chord-section-name";
      name.textContent = section.name;
      if (section.repeatCount > 1) {
        var rep = document.createElement("span");
        rep.className = "chord-section-repeat";
        rep.textContent = "play through ×" + section.repeatCount;
        name.appendChild(rep);
      }
      block.appendChild(name);

      var lyricLines = (section.lines || []).filter(function (l) { return l.lyrics; });
      var build = { heading: name, chordEls: null, chordBeats: null, lineChordEls: null };

      if (lyricLines.length) {
        build.lineChordEls = [];
        lyricLines.forEach(function (line) {
          var rendered = renderLyricLine(line);
          block.appendChild(rendered.el);
          build.lineChordEls.push(rendered.chordEls);
        });
      } else {
        if (section.progression.length) {
          var row = document.createElement("div");
          row.className = "chord-progression-row";
          var chordEls = [];
          section.progression.forEach(function (item) {
            var slot = document.createElement("div");
            slot.className = "chord-prog-item";
            var chordEl = document.createElement("span");
            chordEl.className = "chord-prog-chord";
            chordEl.textContent = item.chord;
            var strumEl = document.createElement("span");
            strumEl.className = "chord-prog-strum";
            strumEl.textContent = entry.strummingPattern;
            slot.appendChild(chordEl);
            slot.appendChild(strumEl);
            row.appendChild(slot);
            chordEls.push(slot);
          });
          block.appendChild(row);
          build.chordEls = chordEls;
          build.chordBeats = section.progression.map(function (c) { return c.beats || 4; });
        }
        if (!section.instrumental || !section.progression.length) {
          var pending = document.createElement("p");
          pending.className = "chord-pending";
          pending.textContent = section.progression.length
            ? "Lyrics not added yet — chords shown above to play by ear."
            : "Nothing added for this section yet.";
          block.appendChild(pending);
        }
      }

      els.sections.appendChild(block);
      sectionBuilds.push({ section: section, build: build });
    });

    chordViewerState.timeline = buildPlaybackTimeline(entry, sectionBuilds);
    chordViewerState.activeTimelineIndex = -1;
    // Normally 0 (openChordViewer just set currentTime to 0 for a fresh
    // open) -- highlighting for the current value instead of a hardcoded 0
    // is what lets a Campfire Groups late-join land on the right chord.
    applyHighlightForTime(chordViewerState.currentTime || 0);
  }

  function parseBeatsPerBar(timeSignature) {
    var m = /^(\d+)\s*\/\s*(\d+)$/.exec(timeSignature || "");
    return m ? parseInt(m[1], 10) : 4;
  }

  // Flattens sections (respecting repeatCount and each chord's real
  // duration in seconds, from playAlongBpm + beats) into an ordered list of
  // {el, heading, startSec, endSec} spanning the whole song. Repeats reuse
  // the same DOM elements — a 4-chord progression played ×4 cycles through
  // the same 4 elements four times, it doesn't clone them. This is genuine
  // musical time: scroll position plays no part in computing it. Only
  // playAlongBpm ever drives this — referenceBpm is informational only and
  // must never reach this function's math.
  function buildPlaybackTimeline(entry, sectionBuilds) {
    var secondsPerBeat = 60 / (entry.playAlongBpm || DEFAULT_BPM);
    var beatsPerBar = parseBeatsPerBar(entry.timeSignature);
    var timeline = [];
    sectionBuilds.forEach(function (item) {
      var section = item.section;
      var build = item.build;
      var repeatCount = section.repeatCount || 1;
      for (var r = 0; r < repeatCount; r++) {
        if (build.chordEls && build.chordEls.length) {
          build.chordEls.forEach(function (el, i) {
            timeline.push({ el: el, heading: build.heading, duration: build.chordBeats[i] * secondsPerBeat });
          });
        } else if (build.lineChordEls && build.lineChordEls.length) {
          build.lineChordEls.forEach(function (chordEls) {
            (chordEls.length ? chordEls : [null]).forEach(function (el) {
              timeline.push({ el: el, heading: build.heading, duration: 4 * secondsPerBeat });
            });
          });
        } else {
          // Nothing to highlight (e.g. an empty outro) — still give it
          // time in the timeline so scroll progress passes through it.
          timeline.push({ el: null, heading: build.heading, duration: beatsPerBar * secondsPerBeat });
        }
      }
    });
    var acc = 0;
    timeline.forEach(function (t) {
      t.startSec = acc;
      acc += t.duration;
      t.endSec = acc;
    });
    return {
      entries: timeline,
      totalSec: acc,
      countInSec: (entry.countInBars || 0) * beatsPerBar * secondsPerBeat,
      secondsPerBeat: secondsPerBeat,
      beatsPerBar: beatsPerBar
    };
  }

  // The one function that decides which chord is "now" — driven purely by
  // the playback clock (elapsed seconds since the count-in ended), never by
  // scroll position or which element happens to be visually centered.
  function applyHighlightForTime(elapsedSec) {
    var timeline = chordViewerState.timeline;
    if (!timeline || !timeline.entries.length) return;
    var entries = timeline.entries;
    var idx = entries.length - 1;
    for (var i = 0; i < entries.length; i++) {
      if (elapsedSec < entries[i].endSec) { idx = i; break; }
    }
    if (idx === chordViewerState.activeTimelineIndex) return;
    chordViewerState.activeTimelineIndex = idx;
    var activeEl = entries[idx].el;
    var activeHeading = entries[idx].heading;

    var seen = new Set();
    entries.forEach(function (t) {
      if (!t.el || seen.has(t.el)) return;
      seen.add(t.el);
      t.el.classList.toggle("chord-row-active", t.el === activeEl);
    });
    document.querySelectorAll(".chord-section-name.chord-section-active").forEach(function (h) {
      if (h !== activeHeading) h.classList.remove("chord-section-active");
    });
    if (activeHeading) activeHeading.classList.add("chord-section-active");
  }

  function setPlayButtonState(isPlaying) {
    var els = chordViewerEls();
    if (!els.playBtn || !els.playLabel) return;
    els.playBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    els.playLabel.innerHTML = isPlaying ? "&#10074;&#10074; Pause" : "&#9654; Play";
  }

  function updateSpeedDisplay() {
    var els = chordViewerEls();
    if (els.speedDisplay) els.speedDisplay.textContent = SPEED_LABELS[chordViewerState.speedIndex];
  }

  // startElapsedSec is optional (defaults to a fresh 0 start, unchanged from
  // before) -- Campfire Groups passes a non-zero value so a late joiner (or a
  // resync after reconnecting) opens the sheet already positioned where the
  // group actually is, instead of restarting the song for them.
  function openChordViewer(id, startElapsedSec) {
    var els = chordViewerEls();
    if (!els.root) return;
    stopAutoScroll();
    chordViewerState.currentId = id;
    chordViewerState.speedIndex = DEFAULT_SPEED_INDEX;
    chordViewerState.currentTime = startElapsedSec > 0 ? startElapsedSec : 0;
    updateSpeedDisplay();
    chordViewerState.lastFocused = document.activeElement;

    renderChordSheet();
    els.root.classList.add("is-open");
    els.root.setAttribute("aria-hidden", "false");
    document.body.classList.add("chord-viewer-open");
    if (els.body) els.body.scrollTop = 0;
    if (chordViewerState.currentTime > 0) positionScrollForActiveRow();

    var closeBtn = document.getElementById("chord-close");
    if (closeBtn) closeBtn.focus();
  }

  // Mirrors the scroll-follow math inside startAutoScroll()'s step() loop,
  // kept as its own small function rather than touching that loop -- used
  // only for placing the sheet correctly the instant it opens (e.g. a
  // Campfire Groups late-join), never during normal playback.
  function positionScrollForActiveRow() {
    var els = chordViewerEls();
    if (!els.body) return;
    var activeRow = els.body.querySelector(".chord-row-active");
    if (!activeRow) return;
    var maxScroll = els.body.scrollHeight - els.body.clientHeight;
    if (maxScroll <= 0) return;
    var rowTopWithinBody = activeRow.getBoundingClientRect().top - els.body.getBoundingClientRect().top + els.body.scrollTop;
    els.body.scrollTop = Math.max(0, Math.min(maxScroll, rowTopWithinBody - AUTOSCROLL_TOP_MARGIN));
  }

  function closeChordViewer() {
    var els = chordViewerEls();
    if (!els.root || !els.root.classList.contains("is-open")) return;
    stopAutoScroll();
    els.root.classList.remove("is-open");
    els.root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chord-viewer-open");
    if (chordViewerState.lastFocused && typeof chordViewerState.lastFocused.focus === "function") {
      chordViewerState.lastFocused.focus();
    }
  }

  function startAutoScroll() {
    var els = chordViewerEls();
    var entry = CHORD_DATA_BY_ID[chordViewerState.currentId];
    var timeline = chordViewerState.timeline;
    if (!els.body || !entry || !timeline) return;

    function beginPlayback() {
      chordViewerState.autoScrollOn = true;
      chordViewerState.lastFrameTime = null;
      setPlayButtonState(true);
      chordViewerState.autoScrollRaf = window.requestAnimationFrame(step);
    }

    function step(timestamp) {
      if (!chordViewerState.autoScrollOn) return;
      if (chordViewerState.lastFrameTime != null) {
        var deltaSec = (timestamp - chordViewerState.lastFrameTime) / 1000;
        chordViewerState.currentTime += deltaSec * SPEED_STEPS[chordViewerState.speedIndex];
        var totalSec = timeline.totalSec || 1;
        var progressFrac = Math.min(1, chordViewerState.currentTime / totalSec);

        applyHighlightForTime(chordViewerState.currentTime);
        var maxScroll = els.body.scrollHeight - els.body.clientHeight;
        if (maxScroll > 0) {
          // Follow the actual active row rather than a straight time-fraction
          // of the whole sheet: sections vary in how much vertical space they
          // take per second, so a purely proportional scroll can drift the
          // active row to the very top edge (or past it) on some songs/mobile
          // heights. Falls back to the old proportional scroll if, for any
          // reason, nothing is marked active yet.
          var activeRow = els.body.querySelector(".chord-row-active");
          var targetScroll;
          if (activeRow) {
            // getBoundingClientRect deltas (not offsetTop) so this is correct
            // regardless of which ancestor happens to be the positioning context.
            var rowTopWithinBody = activeRow.getBoundingClientRect().top - els.body.getBoundingClientRect().top + els.body.scrollTop;
            targetScroll = rowTopWithinBody - AUTOSCROLL_TOP_MARGIN;
          } else {
            targetScroll = progressFrac * maxScroll;
          }
          els.body.scrollTop = Math.max(0, Math.min(maxScroll, targetScroll));
        }

        if (progressFrac >= 1) {
          stopAutoScroll();
          fireEnded();
          return;
        }
      }
      chordViewerState.lastFrameTime = timestamp;
      chordViewerState.autoScrollRaf = window.requestAnimationFrame(step);
    }

    // Count in only for a fresh start, never when resuming mid-song.
    if (chordViewerState.currentTime <= 0 && timeline.countInSec > 0) {
      runCountIn(timeline, beginPlayback);
    } else {
      beginPlayback();
    }
  }

  function runCountIn(timeline, onDone) {
    var totalBeats = Math.round(timeline.countInSec / timeline.secondsPerBeat);
    if (totalBeats <= 0) { onDone(); return; }
    var beatMs = timeline.secondsPerBeat * 1000;
    chordViewerState.countInActive = true;
    setPlayButtonState(true);
    var beat = totalBeats;
    function tick() {
      if (!chordViewerState.countInActive) return;
      showCountInOverlay(beat);
      beat--;
      if (beat <= 0) {
        chordViewerState.countInTimer = window.setTimeout(function () {
          if (!chordViewerState.countInActive) return;
          chordViewerState.countInActive = false;
          hideCountInOverlay();
          onDone();
        }, beatMs);
      } else {
        chordViewerState.countInTimer = window.setTimeout(tick, beatMs);
      }
    }
    tick();
  }

  function cancelCountIn() {
    chordViewerState.countInActive = false;
    if (chordViewerState.countInTimer) {
      window.clearTimeout(chordViewerState.countInTimer);
      chordViewerState.countInTimer = null;
    }
    hideCountInOverlay();
  }

  function showCountInOverlay(n) {
    var el = document.getElementById("chord-countin");
    if (!el) return;
    el.textContent = String(n);
    el.classList.remove("is-visible");
    void el.offsetWidth;
    el.classList.add("is-visible");
  }

  function hideCountInOverlay() {
    var el = document.getElementById("chord-countin");
    if (el) el.classList.remove("is-visible");
  }

  function stopAutoScroll() {
    cancelCountIn();
    chordViewerState.autoScrollOn = false;
    if (chordViewerState.autoScrollRaf) {
      window.cancelAnimationFrame(chordViewerState.autoScrollRaf);
      chordViewerState.autoScrollRaf = null;
    }
    setPlayButtonState(false);
  }

  function togglePlay() {
    if (chordViewerState.autoScrollOn || chordViewerState.countInActive) stopAutoScroll();
    else startAutoScroll();
  }

  function changeSpeed(direction) {
    chordViewerState.speedIndex = Math.min(SPEED_STEPS.length - 1, Math.max(0, chordViewerState.speedIndex + direction));
    updateSpeedDisplay();
  }

  function makeViewChordsButton(song) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "listen-link view-chords-link";
    btn.textContent = "view chords";
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openChordViewer(song.id);
    });
    return btn;
  }

  function initChordEmbers() {
    var el = document.getElementById("chord-embers");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduceMotion) return;
    for (var i = 0; i < 6; i++) {
      var span = document.createElement("span");
      span.className = "ember";
      span.style.setProperty("--x", (10 + Math.random() * 80).toFixed(1) + "%");
      span.style.setProperty("--size", (2 + Math.random() * 2.5).toFixed(1) + "px");
      span.style.setProperty("--dur", (6 + Math.random() * 6).toFixed(2) + "s");
      span.style.setProperty("--delay", (Math.random() * 6).toFixed(2) + "s");
      span.style.setProperty("--drift", (Math.random() * 40 - 20).toFixed(0) + "px");
      el.appendChild(span);
    }
  }

  function initChordViewer() {
    var els = chordViewerEls();
    if (!els.root) return;

    var closeBtn = document.getElementById("chord-close");
    if (closeBtn) closeBtn.addEventListener("click", closeChordViewer);

    els.root.addEventListener("click", function (e) {
      if (e.target === els.root) closeChordViewer();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.root.classList.contains("is-open")) closeChordViewer();
    });

    var playBtn = document.getElementById("chord-play-toggle");
    if (playBtn) playBtn.addEventListener("click", togglePlay);
    var speedDown = document.getElementById("chord-speed-down");
    if (speedDown) speedDown.addEventListener("click", function () { changeSpeed(-1); });
    var speedUp = document.getElementById("chord-speed-up");
    if (speedUp) speedUp.addEventListener("click", function () { changeSpeed(1); });

    initChordEmbers();
  }

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

  function spotifyGlyph() {
    var wrap = document.createElement("span");
    wrap.className = "spotify-glyph";
    wrap.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.72-.66 13.439 1.62.361.181.54.78.302 1.201zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38C8.76 5.939 15.9 6.24 20.281 8.82c.539.301.719 1.021.42 1.561-.3.421-1.02.599-1.62.3z"/></svg>';
    return wrap;
  }

  function makeHeardToggle(song) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "heard-dot" + (heard[song.title] ? " is-heard" : "");
    btn.title = "Mark as heard around the fire";
    btn.setAttribute("aria-pressed", heard[song.title] ? "true" : "false");
    btn.innerHTML =
      '<svg class="scribble-check" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path class="ring" d="M12,3.2 C16.9,3 20.8,6.9 21,11.7 C21.2,16.6 17.3,20.7 12.4,20.9 C7.5,21.1 3.3,17.3 3,12.4 C2.8,7.6 6.6,3.5 12,3.2 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<g class="scribble-fill">' +
      '<path d="M6.5,8.5 L17.8,15.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M6.8,14.6 L17.4,7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M7,11.6 L17.2,11.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      "</g></svg>";
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      heard[song.title] = !heard[song.title];
      btn.classList.toggle("is-heard", !!heard[song.title]);
      btn.setAttribute("aria-pressed", heard[song.title] ? "true" : "false");
      saveHeard(heard);
      updateProgress();
    });
    return btn;
  }

  function buildSongCard(song, index) {
    var track = document.createElement("article");
    track.className = "track reveal";
    track.dataset.mood = song.mood;
    track.style.setProperty("--reveal-delay", Math.min(index * 45, 360) + "ms");
    track.style.setProperty("--row-pad", (14 + (hashString(song.title) % 7)) + "px");

    var num = document.createElement("span");
    num.className = "track-num" + (song.pick ? " is-pick" : "");
    if (song.pick) {
      num.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c.7 2.9 1.6 5 2.7 6.1 1.2 1.2 3.3 2 6.3 2.6-3 .8-5 1.6-6.3 2.8-1.2 1.2-2 3.3-2.7 6.4-.6-3-1.5-5.1-2.7-6.3-1.2-1.2-3.3-2.1-6.3-2.9 3-.6 5-1.4 6.3-2.6 1.2-1.2 2-3.2 2.7-6.1z" fill="currentColor"/></svg>';
      num.title = "a favorite";
    } else {
      num.textContent = String(index + 1).padStart(2, "0");
    }

    var main = document.createElement("div");
    main.className = "track-main";

    var headline = document.createElement("div");
    headline.className = "track-headline";
    var titleEl = document.createElement("h3");
    titleEl.className = "track-title";
    titleEl.textContent = song.title;
    headline.appendChild(titleEl);
    headline.appendChild(makeHeardToggle(song));

    var meta = document.createElement("p");
    meta.className = "track-meta";
    meta.textContent = song.artist + " · " + song.year + " · " + song.mood;
    if (song.capo) {
      var capoSpan = document.createElement("span");
      capoSpan.className = "capo-meta";
      capoSpan.textContent = " · " + song.capo;
      meta.appendChild(capoSpan);
    }

    var detail = document.createElement("p");
    detail.className = "track-detail";
    detail.textContent = "Played on " + song.chords + (song.note ? " — " + song.note : "");

    main.appendChild(headline);
    main.appendChild(meta);
    main.appendChild(detail);

    var actions = document.createElement("div");
    actions.className = "track-actions";

    var chordsBtn = makeViewChordsButton(song);
    var listen = document.createElement("a");
    listen.className = "listen-link";
    listen.href = "https://open.spotify.com/search/" + encodeURIComponent(song.spotify);
    listen.target = "_blank";
    listen.rel = "noopener noreferrer";
    listen.appendChild(spotifyGlyph());
    listen.appendChild(document.createTextNode("listen ↗"));
    listen.addEventListener("click", function (e) { e.stopPropagation(); });

    actions.appendChild(chordsBtn);
    actions.appendChild(listen);

    track.appendChild(num);
    track.appendChild(main);
    track.appendChild(actions);

    if (song.margin) {
      var scrawl = document.createElement("p");
      scrawl.className = "scrawl-note";
      scrawl.style.setProperty("--tilt", tiltFor(song.title, 3, "m") + "deg");
      scrawl.textContent = song.margin;
      track.appendChild(scrawl);
      track.classList.add("has-margin");
    }

    track.addEventListener("click", function () {
      track.classList.toggle("is-expanded");
    });

    return track;
  }

  function buildFeatureCard(container, song) {
    var palette = paletteFor(song.title);
    var scrap = document.createElement("div");
    scrap.className = "feature-scrap";

    var polaroid = document.createElement("figure");
    polaroid.className = "polaroid";
    polaroid.style.setProperty("--tilt", tiltFor(song.title, 4, "p") + "deg");

    var tape = document.createElement("span");
    tape.className = "tape";

    var photo = document.createElement("div");
    photo.className = "polaroid-photo";
    photo.style.setProperty("--hue-a", palette[0]);
    photo.style.setProperty("--hue-b", palette[1]);
    var photoLetter = document.createElement("span");
    photoLetter.textContent = song.title.charAt(0);
    photo.appendChild(photoLetter);

    var caption = document.createElement("figcaption");
    caption.textContent = song.artist + " · " + song.year;

    polaroid.appendChild(tape);
    polaroid.appendChild(photo);
    polaroid.appendChild(caption);

    var text = document.createElement("div");
    text.className = "feature-text";

    var h = document.createElement("h2");
    h.textContent = song.title;

    var reason = document.createElement("p");
    reason.className = "featured-reason";
    reason.textContent = song.reason;

    var line = document.createElement("p");
    line.className = "featured-line";
    line.textContent = "“" + song.line + "”";

    var actions = document.createElement("div");
    actions.className = "featured-actions";

    var link = document.createElement("a");
    link.className = "listen-link big";
    link.href = "https://open.spotify.com/search/" + encodeURIComponent(song.spotify);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.appendChild(spotifyGlyph());
    link.appendChild(document.createTextNode("listen on Spotify ↗"));

    var chordsBtn = makeViewChordsButton(song);
    chordsBtn.classList.add("big");
    var heardBtn = makeHeardToggle(song);

    actions.appendChild(link);
    actions.appendChild(chordsBtn);
    actions.appendChild(heardBtn);

    text.appendChild(h);
    text.appendChild(reason);
    text.appendChild(line);
    text.appendChild(actions);

    scrap.appendChild(polaroid);
    scrap.appendChild(text);
    container.appendChild(scrap);
  }

  function updateProgress() {
    var count = ALL_SONGS.filter(function (s) { return heard[s.title]; }).length;
    var tally = document.getElementById("tally");
    var text = document.getElementById("progress-text");
    if (tally) {
      tally.innerHTML = "";
      for (var i = 0; i < count; i++) {
        var tick = document.createElement("span");
        tick.className = "tick" + ((i + 1) % 5 === 0 ? " tick-group" : "");
        tally.appendChild(tick);
      }
    }
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
    var pills = document.querySelectorAll(".tag-filter");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var mood = pill.dataset.mood;
        document.querySelectorAll("#list-main .track, #list-dying .track").forEach(function (track) {
          var show = mood === "all" || track.dataset.mood === mood;
          track.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  function sparkBurst() {
    var embersEl = document.getElementById("embers");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!embersEl || reduceMotion) return;
    for (var i = 0; i < 7; i++) {
      var span = document.createElement("span");
      span.className = "ember";
      var xPct = 36 + Math.random() * 28;
      var size = 3 + Math.random() * 2.5;
      var dur = 1 + Math.random() * 0.7;
      var drift = (Math.random() * 100 - 50).toFixed(0) + "px";
      span.style.setProperty("--x", xPct + "%");
      span.style.setProperty("--size", size.toFixed(1) + "px");
      span.style.setProperty("--dur", dur.toFixed(2) + "s");
      span.style.setProperty("--delay", (Math.random() * 0.3).toFixed(2) + "s");
      span.style.setProperty("--drift", drift);
      embersEl.appendChild(span);
      window.setTimeout(function (el) {
        return function () { el.remove(); };
      }(span), dur * 1000 * 1.7 + 200);
    }
  }

  function initShuffle() {
    var btn = document.getElementById("shuffle-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      sparkBurst();

      var pills = document.querySelectorAll(".tag-filter");
      pills.forEach(function (p) { p.classList.remove("is-active"); });
      var allPill = document.querySelector('.tag-filter[data-mood="all"]');
      if (allPill) allPill.classList.add("is-active");
      document.querySelectorAll("#list-main .track, #list-dying .track").forEach(function (track) {
        track.classList.remove("is-hidden");
      });

      var tracks = document.querySelectorAll("#list-main .track, #list-dying .track");
      if (!tracks.length) return;
      var pick = tracks[Math.floor(Math.random() * tracks.length)];
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
    }, { threshold: 0.01, rootMargin: "200px 0px -10px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initEmbers() {
    var embersEl = document.getElementById("embers");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!embersEl || reduceMotion) return;
    var count = window.innerWidth < 640 ? 7 : 16;
    var extraCount = window.innerWidth < 640 ? 5 : 10;

    function makeEmber(extra) {
      var span = document.createElement("span");
      span.className = extra ? "ember ember-extra" : "ember";
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

    for (var i = 0; i < count; i++) makeEmber(false);
    for (var j = 0; j < extraCount; j++) makeEmber(true);
  }

  function initSmoke() {
    var el = document.getElementById("smoke");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduceMotion || window.innerWidth < 640) return;
    for (var i = 0; i < 3; i++) {
      var span = document.createElement("span");
      var size = 70 + Math.random() * 60;
      var dur = 10 + Math.random() * 8;
      var delay = i * 3.2 + Math.random() * 2;
      var dx = (Math.random() * 70 - 35).toFixed(0) + "px";
      span.style.setProperty("--sw", size.toFixed(0) + "px");
      span.style.setProperty("--sdur", dur.toFixed(1) + "s");
      span.style.setProperty("--sdelay", delay.toFixed(1) + "s");
      span.style.setProperty("--sx", dx);
      el.appendChild(span);
    }
  }

  function initDust() {
    var el = document.getElementById("dust");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduceMotion) return;
    var count = window.innerWidth < 640 ? 6 : 14;
    for (var i = 0; i < count; i++) {
      var span = document.createElement("span");
      span.className = "mote";
      var size = 1.5 + Math.random() * 2;
      var dur = 20 + Math.random() * 18;
      var delay = Math.random() * 20;
      var dx = (Math.random() * 50 - 25).toFixed(0) + "px";
      var dy = (-30 - Math.random() * 50).toFixed(0) + "px";
      span.style.setProperty("--mx", (Math.random() * 100).toFixed(1) + "%");
      span.style.setProperty("--my", (Math.random() * 100).toFixed(1) + "%");
      span.style.setProperty("--msize", size.toFixed(1) + "px");
      span.style.setProperty("--mdur", dur.toFixed(1) + "s");
      span.style.setProperty("--mdelay", delay.toFixed(1) + "s");
      span.style.setProperty("--mdx", dx);
      span.style.setProperty("--mdy", dy);
      el.appendChild(span);
    }
  }

  function initNearGlow() {
    var targets = document.querySelectorAll(".featured, .playlist-section.dying");
    if (!targets.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("near-glow", entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    targets.forEach(function (t) { io.observe(t); });
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

  /* ---------- campfire mode (visual atmosphere; never touches audio state) ---------- */
  var CAMPFIRE_MODE_KEY = "campfire-mode-enabled";

  function loadCampfireMode() {
    try { return localStorage.getItem(CAMPFIRE_MODE_KEY) === "1"; } catch (e) { return false; }
  }
  function saveCampfireMode(on) {
    try { localStorage.setItem(CAMPFIRE_MODE_KEY, on ? "1" : "0"); } catch (e) {}
  }

  function setCampfireMode(on, btn) {
    document.body.classList.toggle("campfire-mode", on);
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
    saveCampfireMode(on);
  }

  function initCampfireMode() {
    var btn = document.getElementById("campfire-mode-toggle");
    if (!btn) return;
    setCampfireMode(loadCampfireMode(), btn);
    btn.addEventListener("click", function () {
      setCampfireMode(!document.body.classList.contains("campfire-mode"), btn);
    });
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

  // Minimal, read/control-only surface for Campfire Groups (groups.js) to
  // drive this same engine from a shared start time instead of always 0.
  // Deliberately exposes no chord/lyric content -- just ids/titles and the
  // handful of calls needed to open/play/pause at a given elapsed time.
  window.CampfireChordViewer = {
    listSongs: function () {
      return ALL_SONGS.map(function (s) { return { id: s.id, title: s.title }; });
    },
    hasSong: function (id) { return !!CHORD_DATA_BY_ID[id]; },
    openAt: function (id, elapsedSec) { openChordViewer(id, elapsedSec || 0); },
    play: function () { startAutoScroll(); },
    pause: function () { stopAutoScroll(); },
    isPlaying: function () { return !!(chordViewerState.autoScrollOn || chordViewerState.countInActive); },
    getElapsed: function () { return chordViewerState.currentTime || 0; },
    getTotalSec: function () { return (chordViewerState.timeline && chordViewerState.timeline.totalSec) || 0; },
    onEnded: function (fn) { if (typeof fn === "function") endedListeners.push(fn); },
    getCurrentSongId: function () { return chordViewerState.currentId || null; },
    isOpen: function () {
      var els = chordViewerEls();
      return !!(els.root && els.root.classList.contains("is-open"));
    },
    close: function () { closeChordViewer(); }
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    initCategories();
    initShuffle();
    initReveal();
    initEmbers();
    initSmoke();
    initDust();
    initStarParallax();
    initEmbersLowOnFooter();
    initNearGlow();
    initCampfireMode();
    initSoundToggle();
    initChordViewer();
  });
})();
