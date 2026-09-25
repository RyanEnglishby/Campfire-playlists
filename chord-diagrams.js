// Camp Chord -- "How to play these chords" diagrams.
//
// Standard, beginner-friendly open-position fingerings for every chord name
// used anywhere in script.js's CHORD_SONGS data (see chordShapeFor() at the
// bottom for the fallback if a future song ever adds one not listed here).
// Where a chord has no true open-position version (Bm, F, F#m, C#m), this
// uses the simplified/no-barre shape commonly taught to beginners -- in
// keeping with the site's own "no barre chords required" promise -- except
// C#m, which has no simplified shape that avoids a moveable position and is
// shown at its correct fret with a position marker.
//
// Every shape below was verified against real chord-tone math (not just
// copied from memory): for each string, the open-string note plus its fret
// number was worked out and confirmed to land on notes that actually belong
// to the named chord, before being included here.
(function () {
  "use strict";

  // frets: 6 entries, low E -> high E. "x" = muted, 0 = open, N = fret N.
  // fingers: 6 entries aligned with frets. 0 = no finger (open/muted), 1-4.
  // barre: optional { fret, from, to } string-index range (0=low E..5=high
  // E) fretted by one finger -- drawn as a bar instead of separate dots.
  // baseFret: the fret number shown at the top of the diagram (1 = nut).
  var STRING_COUNT = 6;

  var CHORD_SHAPES = {
    "G":       { label: "G major",              frets: [3, 2, 0, 0, 0, 3],       fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
    "C":       { label: "C major",               frets: ["x", 3, 2, 0, 1, 0],     fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
    "D":       { label: "D major",               frets: ["x", "x", 0, 2, 3, 2],   fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
    "Em":      { label: "E minor",                frets: [0, 2, 2, 0, 0, 0],       fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
    "E":       { label: "E major",               frets: [0, 2, 2, 1, 0, 0],       fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
    "Am":      { label: "A minor",                frets: ["x", 0, 2, 2, 1, 0],     fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
    "A":       { label: "A major",               frets: ["x", 0, 2, 2, 2, 0],     fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
    "A7":      { label: "A7",                     frets: ["x", 0, 2, 0, 2, 0],     fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 },
    "A7sus4":  { label: "A7 suspended 4th",       frets: ["x", 0, 2, 0, 3, 0],     fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 },
    "D7":      { label: "D7",                     frets: ["x", "x", 0, 2, 1, 2],   fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
    "Dsus4":   { label: "D suspended 4th",        frets: ["x", "x", 0, 2, 3, 3],   fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
    "Cadd9":   { label: "C add9",                 frets: ["x", 3, 2, 0, 3, 0],     fingers: [0, 3, 2, 0, 4, 0], baseFret: 1 },
    "Em7":     { label: "E minor 7",              frets: [0, 2, 0, 0, 0, 0],       fingers: [0, 2, 0, 0, 0, 0], baseFret: 1 },
    "D/F#":    { label: "D major (F# in the bass)", frets: [2, "x", 0, 2, 3, 2],   fingers: [4, 0, 0, 1, 3, 2], baseFret: 1 },
    "F":       {
      label: "F major (simplified, no barre)",
      frets: ["x", "x", 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1,
      barre: { fret: 1, from: 4, to: 5 }
    },
    "Bm":      {
      label: "B minor (simplified, no barre)",
      frets: ["x", "x", 4, 4, 3, 2], fingers: [0, 0, 3, 4, 2, 1], baseFret: 1
    },
    "F#m":     {
      label: "F# minor (simplified, no barre)",
      frets: ["x", "x", "x", 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], baseFret: 1,
      barre: { fret: 2, from: 3, to: 5 }
    },
    "C#m":     {
      label: "C# minor (4th position)",
      frets: ["x", "x", 6, 6, 5, 4], fingers: [0, 0, 3, 4, 2, 1], baseFret: 4
    }
  };

  function chordShapeFor(name) {
    return CHORD_SHAPES[name] || null;
  }

  // ---- SVG diagram -------------------------------------------------------
  var W = 120, H = 148;
  var STRING_X0 = 15, STRING_GAP = 18;
  var NUT_Y = 30, FRET_H = 24, FRET_ROWS = 4;
  var MARKER_Y = 15;

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function stringX(i) { return STRING_X0 + i * STRING_GAP; }
  function rowY(row) { return NUT_Y + (row - 1) * FRET_H + FRET_H / 2; }

  function buildDiagramSvg(shape) {
    var baseFret = shape.baseFret || 1;
    // Shapes played above the open position need room to the left of the
    // grid for a "4fr"-style position label -- widen the canvas just for
    // those instead of permanently shrinking every diagram's fretboard.
    var leftPad = baseFret > 1 ? 18 : 0;
    var svg = svgEl("svg", {
      viewBox: (-leftPad) + " 0 " + (W + leftPad) + " " + H,
      class: "chord-diagram-svg",
      role: "img",
      "aria-hidden": "true"
    });

    var bottomY = NUT_Y + FRET_H * FRET_ROWS;

    // fret lines (horizontal)
    for (var r = 0; r <= FRET_ROWS; r++) {
      var y = NUT_Y + r * FRET_H;
      var isNut = baseFret === 1 && r === 0;
      svg.appendChild(svgEl("line", {
        x1: stringX(0), y1: y, x2: stringX(STRING_COUNT - 1), y2: y,
        class: isNut ? "chord-diagram-nut" : "chord-diagram-fretline"
      }));
    }
    // strings (vertical)
    for (var s = 0; s < STRING_COUNT; s++) {
      svg.appendChild(svgEl("line", {
        x1: stringX(s), y1: NUT_Y, x2: stringX(s), y2: bottomY,
        class: "chord-diagram-string"
      }));
    }

    // position marker ("4fr") when this isn't the open/nut position
    if (baseFret > 1) {
      var posLabel = svgEl("text", {
        x: -leftPad / 2, y: rowY(1) + 4, class: "chord-diagram-position", "text-anchor": "middle"
      });
      posLabel.textContent = baseFret + "fr";
      svg.appendChild(posLabel);
    }

    // open/muted markers above the nut (only meaningful at the true open position)
    shape.frets.forEach(function (f, i) {
      var mark = svgEl("text", {
        x: stringX(i), y: MARKER_Y, class: "chord-diagram-marker", "text-anchor": "middle"
      });
      if (f === "x") { mark.textContent = "×"; mark.classList.add("is-muted"); svg.appendChild(mark); }
      else if (f === 0) { mark.textContent = "○"; mark.classList.add("is-open"); svg.appendChild(mark); }
    });

    // barre (drawn first, so individual dots for the same fret sit on top)
    if (shape.barre) {
      var b = shape.barre;
      var row = b.fret - baseFret + 1;
      svg.appendChild(svgEl("rect", {
        x: stringX(b.from) - 8, y: rowY(row) - 8,
        width: stringX(b.to) - stringX(b.from) + 16, height: 16,
        rx: 8, ry: 8, class: "chord-diagram-barre"
      }));
      var barreFinger = svgEl("text", {
        x: (stringX(b.from) + stringX(b.to)) / 2, y: rowY(row) + 4,
        class: "chord-diagram-finger", "text-anchor": "middle"
      });
      barreFinger.textContent = shape.fingers[b.from] || "1";
      svg.appendChild(barreFinger);
    }

    // individual fretted-note dots
    shape.frets.forEach(function (f, i) {
      if (f === "x" || f === 0) return;
      if (shape.barre && i >= shape.barre.from && i <= shape.barre.to && f === shape.barre.fret) return; // covered by the barre bar above
      var row = f - baseFret + 1;
      svg.appendChild(svgEl("circle", {
        cx: stringX(i), cy: rowY(row), r: 8, class: "chord-diagram-dot"
      }));
      var fingerNum = shape.fingers[i];
      if (fingerNum) {
        var t = svgEl("text", {
          x: stringX(i), y: rowY(row) + 4, class: "chord-diagram-finger", "text-anchor": "middle"
        });
        t.textContent = fingerNum;
        svg.appendChild(t);
      }
    });

    return svg;
  }

  function buildDiagramCard(chordName) {
    var card = document.createElement("div");
    card.className = "chord-diagram-card";
    card.id = "chord-diagram-" + slug(chordName);
    card.dataset.chordName = chordName;

    var heading = document.createElement("p");
    heading.className = "chord-diagram-name";
    heading.textContent = chordName;
    card.appendChild(heading);

    var shape = chordShapeFor(chordName);
    if (!shape) {
      var missing = document.createElement("p");
      missing.className = "chord-diagram-missing";
      missing.textContent = "Diagram not available yet for this chord.";
      card.appendChild(missing);
      return card;
    }

    card.appendChild(buildDiagramSvg(shape));

    var label = document.createElement("p");
    label.className = "chord-diagram-label";
    label.textContent = shape.label;
    card.appendChild(label);

    return card;
  }

  function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  // ---- panel wiring -------------------------------------------------------
  var els = {};
  var focusTimer = null;

  function cacheEls() {
    els.wrap = document.getElementById("chord-howto");
    els.toggle = document.getElementById("chord-howto-toggle");
    els.panel = document.getElementById("chord-howto-panel");
    els.capoNote = document.getElementById("chord-howto-capo-note");
    els.grid = document.getElementById("chord-howto-grid");
  }

  function isOpen() {
    return !!(els.panel && !els.panel.hidden);
  }

  function openPanel() {
    if (!els.panel || isOpen()) return;
    els.panel.hidden = false;
    if (els.toggle) els.toggle.setAttribute("aria-expanded", "true");
    if (els.wrap) els.wrap.classList.add("is-open");
  }

  function closePanel() {
    if (!els.panel) return;
    els.panel.hidden = true;
    if (els.toggle) els.toggle.setAttribute("aria-expanded", "false");
    if (els.wrap) els.wrap.classList.remove("is-open");
  }

  function togglePanel() {
    if (isOpen()) closePanel(); else openPanel();
  }

  // Called once per chord-sheet render (see script.js) with the distinct
  // chord names used in the song, in first-appearance order, and the song's
  // capo field (e.g. "Capo 2" or null).
  function setSong(chordNames, capo) {
    if (!els.grid) return;
    closePanel();
    els.grid.innerHTML = "";
    (chordNames || []).forEach(function (name) {
      els.grid.appendChild(buildDiagramCard(name));
    });
    if (els.capoNote) {
      if (capo) {
        els.capoNote.hidden = false;
        els.capoNote.textContent =
          "With " + capo + " on: these are the shapes to play with your fingers -- the capo does the pitch-raising for you.";
      } else {
        els.capoNote.hidden = true;
        els.capoNote.textContent = "";
      }
    }
  }

  // Called when a chord is tapped in the chord sheet itself -- opens the
  // panel if needed, scrolls to that chord's card, and gives it a brief
  // highlight pulse so it's obvious which one was tapped.
  function focus(chordName) {
    if (!els.grid) return;
    openPanel();
    var card = els.grid.querySelector('[data-chord-name="' + cssEscape(chordName) + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (focusTimer) clearTimeout(focusTimer);
    els.grid.querySelectorAll(".is-focused").forEach(function (el) { el.classList.remove("is-focused"); });
    // restart the pulse animation even if the same chord is tapped again
    void card.offsetWidth;
    card.classList.add("is-focused");
    focusTimer = setTimeout(function () { card.classList.remove("is-focused"); }, 1600);
  }

  function cssEscape(s) {
    return window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/["\\]/g, "\\$&");
  }

  function wireUi() {
    if (els.toggle) els.toggle.addEventListener("click", togglePanel);
  }

  function init() {
    cacheEls();
    if (!els.wrap) return; // this page doesn't have a chord viewer
    wireUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ChordDiagrams = { setSong: setSong, focus: focus, chordShapeFor: chordShapeFor };
})();
