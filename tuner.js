(function () {
  "use strict";

  var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var STANDARD_STRINGS = [
    { label: "6th", note: "E2", freq: 82.41 },
    { label: "5th", note: "A2", freq: 110.00 },
    { label: "4th", note: "D3", freq: 146.83 },
    { label: "3rd", note: "G3", freq: 196.00 },
    { label: "2nd", note: "B3", freq: 246.94 },
    { label: "1st", note: "E4", freq: 329.63 }
  ];

  // Guitar's practical range, well past the low E and high fret territory
  // either side. Anything outside this is rejected before it can register
  // as a note at all.
  var MIN_FREQ = 55;
  var MAX_FREQ = 1000;

  // A frame is only trusted as a real pitch if the signal is loud enough
  // (RMS) and the autocorrelation peak is sharp enough (clarity) — the
  // second check is what mainly keeps noise and octave-confusion out.
  var RMS_THRESHOLD = 0.01;
  var CLARITY_THRESHOLD = 0.90;

  // Smoothing window: median of the last N confident readings (in
  // continuous-semitone space, not raw Hz) is what actually drives the
  // display, so a single stray reading can't yank the needle around.
  var HISTORY_SIZE = 8;
  var SILENCE_RESET_MS = 500;

  var state = {
    audioCtx: null,
    stream: null,
    analyser: null,
    buffer: null,
    rafId: null,
    running: false,
    history: [],
    lastConfidentAt: 0
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.startBtn = $("tuner-start");
    els.stopBtn = $("tuner-stop");
    els.card = $("tuner-card");
    els.noteName = $("tuner-note-name");
    els.noteOctave = $("tuner-note-octave");
    els.freq = $("tuner-freq");
    els.cents = $("tuner-cents");
    els.status = $("tuner-status");
    els.needle = $("tuner-needle");
    els.meter = $("tuner-meter");
    els.error = $("tuner-error");
    els.listening = $("tuner-listening");
    els.readout = $("tuner-readout");
    els.stringRows = Array.prototype.slice.call(document.querySelectorAll(".tuner-string-row"));
  }

  function toMidi(freq) { return 12 * (Math.log(freq / 440) / Math.LN2) + 69; }
  function toFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function median(values) {
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Normalized-autocorrelation (NSDF-style) pitch detection with parabolic
  // interpolation for sub-sample accuracy. Returns a frequency in Hz, or -1
  // when the signal is too quiet or not periodic enough to trust.
  //
  // Each lag's correlation is normalized by the energy of that SAME
  // shrinking overlap window (not the full buffer). A plain raw-sum
  // autocorrelation divided by the full-window energy biases against long
  // periods (low notes need a large lag, which leaves a short overlap and
  // therefore a small raw sum against a fixed large denominator) and can
  // even let a small, wrong lag win outright. Normalizing per-lag removes
  // that bias so every lag is compared fairly.
  function detectPitch(buf, sampleRate) {
    var size = buf.length;

    var rms = 0;
    for (var i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    if (rms < RMS_THRESHOLD) return -1;

    // Trim near-silent head/tail so the window is centered on real signal.
    var start = 0, end = size - 1;
    var trimThresh = rms * 0.5;
    while (start < size / 2 && Math.abs(buf[start]) < trimThresh) start++;
    while (end > size / 2 && Math.abs(buf[end]) < trimThresh) end--;
    if (end - start < 512) return -1;

    var maxLag = Math.min(end - start - 1, Math.floor(sampleRate / MIN_FREQ));
    var minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ));
    if (maxLag <= minLag) return -1;

    var d = {};
    for (var lag = minLag; lag <= maxLag; lag++) {
      var corr = 0, energy = 0;
      var n = end - lag;
      for (var j = start; j < n; j++) {
        corr += buf[j] * buf[j + lag];
        energy += buf[j] * buf[j] + buf[j + lag] * buf[j + lag];
      }
      d[lag] = energy > 0 ? (2 * corr / energy) : 0;
    }

    // Walk forward from the shortest lag and take the first local peak that
    // clears the clarity threshold. Picking the fundamental this way (not
    // the global max) is what keeps this from locking onto an octave.
    var bestLag = -1;
    for (var lag2 = minLag + 1; lag2 < maxLag; lag2++) {
      if (d[lag2] >= CLARITY_THRESHOLD && d[lag2] >= d[lag2 - 1] && d[lag2] >= d[lag2 + 1]) {
        bestLag = lag2;
        break;
      }
    }
    if (bestLag < 0) return -1;

    var y0 = d[bestLag - 1];
    var y1 = d[bestLag];
    var y2 = d[bestLag + 1];
    var denom = y0 - 2 * y1 + y2;
    var shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
    var refinedLag = bestLag + Math.max(-0.5, Math.min(0.5, shift));

    return sampleRate / refinedLag;
  }

  function setPermissionError(message) {
    if (!els.error) return;
    if (message) {
      els.error.textContent = message;
      els.error.classList.add("is-visible");
    } else {
      els.error.classList.remove("is-visible");
      els.error.textContent = "";
    }
  }

  function setRunningUI(running) {
    els.startBtn.hidden = running;
    els.stopBtn.hidden = !running;
    els.card.classList.toggle("is-running", running);
    if (!running) {
      els.readout.classList.remove("is-listening");
      els.listening.hidden = true;
      els.stringRows.forEach(function (row) { row.classList.remove("is-active"); });
      resetNeedle();
    }
  }

  function resetNeedle() {
    els.needle.style.left = "50%";
    els.meter.classList.remove("meter-in-tune");
    els.noteName.textContent = "–";
    els.noteOctave.textContent = "";
    els.freq.textContent = "–";
    els.cents.textContent = "–";
    els.status.textContent = "";
  }

  function highlightClosestString(freq) {
    var midi = toMidi(freq);
    var closest = null;
    var closestDist = Infinity;
    STANDARD_STRINGS.forEach(function (s) {
      var dist = Math.abs(midi - toMidi(s.freq));
      if (dist < closestDist) { closestDist = dist; closest = s; }
    });
    var isClose = closest && closestDist <= 3; // within 3 semitones
    els.stringRows.forEach(function (row) {
      row.classList.toggle("is-active", !!(isClose && row.getAttribute("data-note") === closest.note));
    });
  }

  function updateDisplay(smoothedMidi) {
    var rounded = Math.round(smoothedMidi);
    var cents = Math.round((smoothedMidi - rounded) * 100);
    var name = NOTE_NAMES[((rounded % 12) + 12) % 12];
    var octave = Math.floor(rounded / 12) - 1;
    var freq = toFreq(smoothedMidi);
    var clamped = Math.max(-50, Math.min(50, cents));
    var inTune = Math.abs(cents) <= 5;

    els.readout.classList.remove("is-listening");
    els.listening.hidden = true;

    els.noteName.textContent = name;
    els.noteOctave.textContent = octave;
    els.freq.textContent = freq.toFixed(1) + " Hz";
    els.cents.textContent = (cents > 0 ? "+" : "") + cents + " cents";
    els.needle.style.left = (50 + (clamped / 50) * 50) + "%";
    els.meter.classList.toggle("meter-in-tune", inTune);
    els.card.classList.toggle("is-in-tune", inTune);
    els.status.textContent = inTune ? "In Tune" : (cents < 0 ? "Tune Up" : "Tune Down");

    highlightClosestString(freq);
  }

  function loop(timestamp) {
    if (!state.running) return;
    state.analyser.getFloatTimeDomainData(state.buffer);
    var freq = detectPitch(state.buffer, state.audioCtx.sampleRate);

    if (freq > 0) {
      state.history.push(toMidi(freq));
      if (state.history.length > HISTORY_SIZE) state.history.shift();
      state.lastConfidentAt = timestamp;
    } else if (timestamp - state.lastConfidentAt > SILENCE_RESET_MS) {
      state.history = [];
    }

    if (state.history.length >= 3) {
      updateDisplay(median(state.history));
    } else {
      els.readout.classList.add("is-listening");
      els.listening.hidden = false;
      els.card.classList.remove("is-in-tune");
      els.meter.classList.remove("meter-in-tune");
      els.needle.style.left = "50%";
    }

    state.rafId = window.requestAnimationFrame(loop);
  }

  function startTuner() {
    if (state.running) return;
    setPermissionError(null);

    var constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      state.stream = stream;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
      if (state.audioCtx.state === "suspended") state.audioCtx.resume();

      var source = state.audioCtx.createMediaStreamSource(stream);
      state.analyser = state.audioCtx.createAnalyser();
      state.analyser.fftSize = 2048;
      state.analyser.smoothingTimeConstant = 0;
      source.connect(state.analyser);

      state.buffer = new Float32Array(state.analyser.fftSize);
      state.history = [];
      state.lastConfidentAt = performance.now();
      state.running = true;

      setRunningUI(true);
      els.readout.classList.add("is-listening");
      els.listening.hidden = false;
      state.rafId = window.requestAnimationFrame(loop);
    }).catch(function () {
      setPermissionError("Microphone access is needed to use the tuner.");
      setRunningUI(false);
    });
  }

  function stopTuner() {
    state.running = false;
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.stream) {
      state.stream.getTracks().forEach(function (track) { track.stop(); });
      state.stream = null;
    }
    if (state.audioCtx) {
      state.audioCtx.close();
      state.audioCtx = null;
    }
    state.analyser = null;
    state.buffer = null;
    state.history = [];
    setRunningUI(false);
  }

  function renderStandardStrings() {
    var list = $("tuner-strings");
    if (!list) return;
    STANDARD_STRINGS.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "tuner-string-row";
      row.setAttribute("data-note", s.note);
      row.innerHTML =
        '<span class="tuner-string-ordinal">' + s.label + '</span>' +
        '<span class="tuner-string-note">' + s.note + '</span>' +
        '<span class="tuner-string-freq">' + s.freq.toFixed(2) + ' Hz</span>';
      list.appendChild(row);
    });
  }

  function init() {
    cacheEls();
    renderStandardStrings();
    cacheEls(); // pick up the just-rendered .tuner-string-row elements
    resetNeedle();

    els.startBtn.addEventListener("click", startTuner);
    els.stopBtn.addEventListener("click", stopTuner);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      els.startBtn.disabled = true;
      setPermissionError("This browser doesn't support microphone access.");
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state.running) stopTuner();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
