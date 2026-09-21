(function () {
  "use strict";

  // ---- config -------------------------------------------------------
  // Fill these in after running supabase/schema.sql in a Supabase project.
  // The anon key is meant to be public (same trust model as any Supabase
  // static-site setup) -- real protection is the RLS + RPC in schema.sql,
  // not secrecy of this key.
  var SUPABASE_URL = "https://gvsvobehytjgidclilwa.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_CudMVeTx70qoNujEcYmb1Q_ZHVA0w4x";
  var SUPABASE_CONFIGURED =
    SUPABASE_URL.indexOf("YOUR_SUPABASE") === -1 &&
    SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE") === -1;

  var ROOM_MAX_AGE_MS = 6 * 60 * 60 * 1000;
  var START_BUFFER_MS = 3000;
  var CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  var CODE_LENGTH = 5;
  var GUEST_LABELS = [
    "Firefly", "Ember", "Spark", "Kindling", "Cinder", "Smoke",
    "Flint", "Ash", "Driftwood", "Lantern", "Nightjar", "Marshmallow"
  ];
  var SESSION_KEY = "campfire-group-session";

  var els = {};
  var supabaseClient = null;
  var channel = null;
  var countdownInterval = null;
  var room = null; // { id, code, isHost, hostSecret, songId, status, startAt, pausedAtSec, mode, votes, votingOpen, createdAt }
  var myPresenceKey = null;
  var myLabel = null;
  var iAmReady = false;

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.section = $("groups");
    els.entry = $("groups-entry");
    els.startBtn = $("groups-start-btn");
    els.joinBtn = $("groups-join-btn");
    els.joinModal = $("groups-join-modal");
    els.joinForm = $("groups-join-form");
    els.joinCodeInput = $("groups-join-code");
    els.joinNotice = $("groups-join-notice");
    els.panel = $("groups-panel");
    els.roomCode = $("groups-room-code");
    els.roster = $("groups-roster");
    els.hostBanner = $("groups-host-disconnected");
    els.songPickerWrap = $("groups-song-picker-wrap");
    els.songSelect = $("groups-song-select");
    els.songLabelWrap = $("groups-song-label-wrap");
    els.songLabel = $("groups-song-label");
    els.readyWrap = $("groups-ready-wrap");
    els.readyToggle = $("groups-ready-toggle");
    els.countdown = $("groups-countdown");
    els.startControl = $("groups-start-control");
    els.pauseControl = $("groups-pause-control");
    els.resumeControl = $("groups-resume-control");
    els.leaveBtn = $("groups-leave-btn");
    els.notConfigured = $("groups-not-configured");
    els.floatBar = $("groups-float-bar");
    els.floatCode = $("groups-float-code-text");
    els.floatCountdown = $("groups-float-countdown");
    els.floatStart = $("groups-float-start");
    els.floatPause = $("groups-float-pause");
    els.floatResume = $("groups-float-resume");
    els.floatVoteStart = $("groups-float-vote-start");
    els.modeModal = $("groups-mode-modal");
    els.modeCards = document.querySelectorAll(".groups-mode-card");
    els.randomDisplay = $("groups-random-display");
    els.randomSongTitle = $("groups-random-song-title");
    els.votePanel = $("groups-vote-panel");
    els.voteOpenWrap = $("groups-vote-open-wrap");
    els.voteClosedWrap = $("groups-vote-closed-wrap");
    els.voteClosedLabel = $("groups-vote-closed-label");
    els.voteStartBtn = $("groups-vote-start-btn");
    els.voteFinalizeBtn = $("groups-vote-finalize-btn");
    els.voteList = $("groups-vote-list");
  }

  // ---- small helpers --------------------------------------------------
  function randomCode() {
    var out = "";
    for (var i = 0; i < CODE_LENGTH; i++) {
      out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return out;
  }

  function randomToken() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  function randomLabel() {
    var word = GUEST_LABELS[Math.floor(Math.random() * GUEST_LABELS.length)];
    return word + " " + (1 + Math.floor(Math.random() * 98));
  }

  function getClient() {
    if (!supabaseClient && SUPABASE_CONFIGURED && window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
  }

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        code: room.code,
        id: room.id,
        isHost: room.isHost,
        hostSecret: room.hostSecret || null,
        presenceKey: myPresenceKey,
        label: myLabel
      }));
    } catch (e) {}
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  // ---- Supabase reads/writes ------------------------------------------
  var ROOM_COLUMNS = "id, code, song_id, status, start_at, paused_at_sec, mode, votes, voting_open, created_at";

  function createRoomRow(code, hostSecret, mode) {
    return getClient()
      .from("campfire_rooms")
      .insert({ code: code, host_secret: hostSecret, mode: mode })
      .select(ROOM_COLUMNS)
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  }

  function fetchRoomByCode(code) {
    return getClient()
      .from("campfire_rooms")
      .select(ROOM_COLUMNS)
      .eq("code", code)
      .single()
      .then(function (res) {
        if (res.error || !res.data) return null;
        return res.data;
      });
  }

  function fetchRoomById(id) {
    return getClient()
      .from("campfire_rooms")
      .select(ROOM_COLUMNS)
      .eq("id", id)
      .single()
      .then(function (res) {
        if (res.error || !res.data) return null;
        return res.data;
      });
  }

  function pushRoomState(patch) {
    var next = {
      songId: patch.songId !== undefined ? patch.songId : room.songId,
      status: patch.status !== undefined ? patch.status : room.status,
      startAt: patch.startAt !== undefined ? patch.startAt : room.startAt,
      pausedAtSec: patch.pausedAtSec !== undefined ? patch.pausedAtSec : room.pausedAtSec
    };
    return getClient()
      .rpc("update_campfire_room", {
        p_code: room.code,
        p_secret: room.hostSecret,
        p_song_id: next.songId,
        p_status: next.status,
        p_start_at: next.startAt,
        p_paused_at_sec: next.pausedAtSec
      })
      .then(function (res) {
        if (res.error || res.data !== true) throw new Error("Campfire Groups: host update rejected");
      });
  }

  function startVotingRoundRpc() {
    return getClient()
      .rpc("start_campfire_vote", { p_code: room.code, p_secret: room.hostSecret })
      .then(function (res) {
        if (res.error || res.data !== true) throw new Error("Campfire Groups: couldn't open voting");
      });
  }

  function finalizeVoteRpc(songId) {
    return getClient()
      .rpc("finalize_campfire_vote", { p_code: room.code, p_secret: room.hostSecret, p_song_id: songId })
      .then(function (res) {
        if (res.error || res.data !== true) throw new Error("Campfire Groups: couldn't finalize the vote");
      });
  }

  function castVoteRpc(songId) {
    return getClient()
      .rpc("cast_campfire_vote", { p_code: room.code, p_voter_key: myPresenceKey, p_song_id: songId })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data === true;
      });
  }

  function isRoomExpired(row) {
    return Date.now() - new Date(row.created_at).getTime() > ROOM_MAX_AGE_MS;
  }

  function applyRow(row) {
    room.songId = row.song_id;
    room.status = row.status;
    room.startAt = row.start_at;
    room.pausedAtSec = row.paused_at_sec || 0;
    room.mode = row.mode || "host";
    room.votes = row.votes || {};
    room.votingOpen = !!row.voting_open;
  }

  // ---- Random mode --------------------------------------------------------
  function pickRandomSongId(excludeId) {
    var songs = window.CampfireChordViewer ? window.CampfireChordViewer.listSongs() : [];
    if (!songs.length) return null;
    var pool = songs.filter(function (s) { return s.id !== excludeId; });
    if (!pool.length) pool = songs; // only one song total -- can't avoid a repeat
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  function pickAndPushRandomSong() {
    if (!room.isHost) return;
    var nextId = pickRandomSongId(room.songId);
    if (!nextId) return;
    pushRoomState({
      songId: nextId,
      status: "playing",
      startAt: new Date(Date.now() + START_BUFFER_MS).toISOString(),
      pausedAtSec: 0
    }).catch(showHostError);
  }

  // ---- Vote mode ------------------------------------------------------------
  function startVotingRound() {
    if (!room.isHost) return;
    startVotingRoundRpc().catch(showHostError);
  }

  function castVote(songId) {
    if (!room || !room.votingOpen) return;
    castVoteRpc(songId).catch(function () {
      window.alert("Couldn't record your vote — check your connection and try again.");
    });
  }

  function tallyVotes(votes) {
    var counts = {};
    Object.keys(votes || {}).forEach(function (voterKey) {
      var songId = votes[voterKey];
      if (!window.CampfireChordViewer || !window.CampfireChordViewer.hasSong(songId)) return;
      counts[songId] = (counts[songId] || 0) + 1;
    });
    var max = 0;
    Object.keys(counts).forEach(function (id) { if (counts[id] > max) max = counts[id]; });
    var topIds = Object.keys(counts).filter(function (id) { return counts[id] === max; });
    return { counts: counts, winnerId: topIds.length ? topIds[Math.floor(Math.random() * topIds.length)] : null };
  }

  function finalizeVote() {
    if (!room.isHost) return;
    var tally = tallyVotes(room.votes);
    // Nobody voted -- fall back to a random pick so the campfire never gets
    // stuck waiting on a round nobody participated in.
    var winnerId = tally.winnerId || pickRandomSongId(room.songId);
    if (!winnerId) return;
    finalizeVoteRpc(winnerId).catch(showHostError);
  }

  // ---- auto-advance when a song finishes on its own ------------------------
  function handleSongEnded() {
    if (!room || !room.isHost) return;
    if (room.mode === "random") pickAndPushRandomSong();
    else if (room.mode === "vote") startVotingRound();
    // host mode: no automatic action -- the host picks the next song.
  }

  // ---- realtime channel -------------------------------------------------
  function subscribeToRoom() {
    var client = getClient();
    channel = client.channel("campfire-room-" + room.id, {
      config: { presence: { key: myPresenceKey } }
    });

    channel.on("presence", { event: "sync" }, renderRoster);

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "campfire_rooms", filter: "id=eq." + room.id },
      function (payload) {
        applyRow(payload.new);
        renderPanel();
        syncToRoomState();
      }
    );

    channel.subscribe(function (status) {
      if (status === "SUBSCRIBED") {
        channel.track({ label: myLabel, isHost: room.isHost, ready: iAmReady, joinedAt: Date.now() });
      }
    });
  }

  function leaveRoom() {
    clearCountdown();
    if (channel) {
      try { channel.untrack(); } catch (e) {}
      try { getClient().removeChannel(channel); } catch (e) {}
      channel = null;
    }
    if (window.CampfireChordViewer && window.CampfireChordViewer.isOpen()) {
      window.CampfireChordViewer.pause();
    }
    if (els.floatBar) els.floatBar.hidden = true;
    room = null;
    clearSession();
    renderEntry();
  }

  window.addEventListener("beforeunload", function () {
    if (channel) { try { channel.untrack(); } catch (e) {} }
  });

  // ---- playback sync state machine --------------------------------------
  function clearCountdown() {
    if (countdownInterval) { window.clearInterval(countdownInterval); countdownInterval = null; }
    if (els.countdown) els.countdown.hidden = true;
    if (els.floatCountdown) els.floatCountdown.hidden = true;
  }

  function armCountdown(startAtMs) {
    clearCountdown();
    if (els.countdown) els.countdown.hidden = false;
    if (els.floatCountdown) els.floatCountdown.hidden = false;
    function tick() {
      var remaining = startAtMs - Date.now();
      if (remaining <= 0) {
        clearCountdown();
        syncToRoomState();
        return;
      }
      var text = "Starting in " + Math.ceil(remaining / 1000) + "…";
      if (els.countdown) els.countdown.textContent = text;
      if (els.floatCountdown) els.floatCountdown.textContent = text;
    }
    tick();
    countdownInterval = window.setInterval(tick, 100);
  }

  // Single entry point for "make the local chord viewer match room state,"
  // used identically for a fresh song selection, Start, Pause, Resume, a
  // late join, and a reconnect resync -- one code path, no special cases
  // duplicated per event type.
  function syncToRoomState() {
    if (!window.CampfireChordViewer || !room) {
      clearCountdown();
      return;
    }

    // While a vote is open there's no "current song" to show -- room.songId
    // still holds whatever last played, but showing that sheet would just
    // cover the vote list underneath it (the same reason Host Picks needed
    // the floating bar, except here the right fix is simply nothing open).
    if (room.mode === "vote" && room.votingOpen) {
      clearCountdown();
      if (window.CampfireChordViewer.isOpen()) window.CampfireChordViewer.close();
      return;
    }

    if (!room.songId) {
      clearCountdown();
      return;
    }

    if (room.status === "playing" && room.startAt) {
      var startMs = new Date(room.startAt).getTime();
      var msUntil = startMs - Date.now();
      if (msUntil > 0) {
        window.CampfireChordViewer.openAt(room.songId, 0);
        armCountdown(startMs);
      } else {
        clearCountdown();
        window.CampfireChordViewer.openAt(room.songId, (Date.now() - startMs) / 1000);
        window.CampfireChordViewer.play();
      }
      renderPanel();
      return;
    }

    clearCountdown();
    window.CampfireChordViewer.openAt(room.songId, room.status === "paused" ? room.pausedAtSec || 0 : 0);
    renderPanel();
  }

  // ---- host actions -----------------------------------------------------
  function selectSong(songId) {
    if (!room.isHost) return;
    pushRoomState({ songId: songId, status: "idle", startAt: null, pausedAtSec: 0 }).catch(showHostError);
  }

  function startSong() {
    if (!room.isHost || !room.songId) return;
    pushRoomState({
      status: "playing",
      startAt: new Date(Date.now() + START_BUFFER_MS).toISOString(),
      pausedAtSec: 0
    }).catch(showHostError);
  }

  function pauseSong() {
    if (!room.isHost) return;
    var elapsed = window.CampfireChordViewer ? window.CampfireChordViewer.getElapsed() : 0;
    pushRoomState({ status: "paused", startAt: null, pausedAtSec: elapsed }).catch(showHostError);
  }

  function resumeSong() {
    if (!room.isHost) return;
    var startAt = new Date(Date.now() + START_BUFFER_MS - (room.pausedAtSec || 0) * 1000).toISOString();
    pushRoomState({ status: "playing", startAt: startAt }).catch(showHostError);
  }

  function showHostError() {
    window.alert("Couldn't update the campfire — check your connection and try again.");
  }

  // ---- presence / roster --------------------------------------------------
  function renderRoster() {
    if (!els.roster || !channel) return;
    var state = channel.presenceState();
    var rows = [];
    Object.keys(state).forEach(function (key) {
      var metas = state[key];
      if (metas && metas.length) rows.push(metas[0]);
    });
    rows.sort(function (a, b) { return (a.joinedAt || 0) - (b.joinedAt || 0); });

    els.roster.innerHTML = "";
    var hostPresent = false;
    rows.forEach(function (p) {
      if (p.isHost) hostPresent = true;
      var li = document.createElement("li");
      li.className = "groups-roster-row";
      var name = document.createElement("span");
      name.className = "groups-roster-name";
      name.textContent = p.label + (p.isHost ? " • Host" : "");
      li.appendChild(name);
      if (!p.isHost) {
        var ready = document.createElement("span");
        ready.className = "groups-roster-ready" + (p.ready ? " is-ready" : "");
        ready.textContent = p.ready ? "Ready" : "Not ready";
        li.appendChild(ready);
      }
      els.roster.appendChild(li);
    });

    if (els.hostBanner) els.hostBanner.hidden = hostPresent || room.isHost;
  }

  // ---- rendering ----------------------------------------------------------
  function renderEntry() {
    if (els.entry) els.entry.hidden = false;
    if (els.panel) els.panel.hidden = true;
  }

  function findSongById(id) {
    if (!id || !window.CampfireChordViewer) return null;
    return window.CampfireChordViewer.listSongs().filter(function (s) { return s.id === id; })[0] || null;
  }

  function populateSongSelect() {
    if (!els.songSelect || !window.CampfireChordViewer) return;
    els.songSelect.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = !room.songId;
    placeholder.textContent = "Choose a song…";
    els.songSelect.appendChild(placeholder);
    window.CampfireChordViewer.listSongs().forEach(function (song) {
      var opt = document.createElement("option");
      opt.value = song.id;
      opt.textContent = song.title;
      if (song.id === room.songId) opt.selected = true;
      els.songSelect.appendChild(opt);
    });
  }

  function renderPanel() {
    if (!room) return;
    if (els.entry) els.entry.hidden = true;
    if (els.panel) els.panel.hidden = false;
    if (els.roomCode) els.roomCode.textContent = room.code;

    var mode = room.mode || "host";
    if (els.songPickerWrap) els.songPickerWrap.hidden = !(mode === "host" && room.isHost);
    if (els.songLabelWrap) els.songLabelWrap.hidden = !(mode === "host" && !room.isHost);
    if (els.randomDisplay) els.randomDisplay.hidden = mode !== "random";
    if (els.votePanel) els.votePanel.hidden = mode !== "vote";

    if (mode === "host") {
      if (room.isHost) {
        populateSongSelect();
      } else if (els.songLabel) {
        var song = findSongById(room.songId);
        els.songLabel.textContent = song ? song.title : "Waiting for the host to pick a song…";
      }
    } else if (mode === "random") {
      if (els.randomSongTitle) {
        var randomSong = findSongById(room.songId);
        els.randomSongTitle.textContent = randomSong ? randomSong.title : "Picking a song…";
      }
    } else if (mode === "vote") {
      renderVotePanel();
    }

    if (els.readyWrap) els.readyWrap.hidden = room.isHost;

    var counting = room.status === "playing" && room.startAt && new Date(room.startAt).getTime() > Date.now();
    var showStart = room.isHost && !!room.songId && room.status === "idle";
    var showPause = room.isHost && room.status === "playing" && !counting;
    var showResume = room.isHost && room.status === "paused";
    if (els.startControl) els.startControl.hidden = !showStart;
    if (els.pauseControl) els.pauseControl.hidden = !showPause;
    if (els.resumeControl) els.resumeControl.hidden = !showResume;

    // The chord viewer (when open) is a full-screen modal that sits on top
    // of this panel -- the floating bar is how the host keeps control while
    // looking at the sheet, so it mirrors the same three buttons.
    var viewerOpen = window.CampfireChordViewer && window.CampfireChordViewer.isOpen();
    var showVoteStart = room.isHost && mode === "vote" && !room.votingOpen;
    if (els.floatBar) els.floatBar.hidden = !(room.isHost && viewerOpen);
    if (els.floatCode) els.floatCode.textContent = room.code;
    if (els.floatStart) els.floatStart.hidden = !showStart;
    if (els.floatPause) els.floatPause.hidden = !showPause;
    if (els.floatVoteStart) els.floatVoteStart.hidden = !showVoteStart;
    if (els.floatResume) els.floatResume.hidden = !showResume;

    renderRoster();
  }

  function renderVotePanel() {
    if (!room) return;
    var open = room.votingOpen;
    if (els.voteOpenWrap) els.voteOpenWrap.hidden = !open;
    if (els.voteClosedWrap) els.voteClosedWrap.hidden = open;

    if (open) {
      renderVoteList();
      if (els.voteFinalizeBtn) els.voteFinalizeBtn.hidden = !room.isHost;
    } else {
      if (els.voteClosedLabel) {
        var song = findSongById(room.songId);
        els.voteClosedLabel.textContent = song ? song.title : "Waiting for the host to open voting…";
      }
      if (els.voteStartBtn) els.voteStartBtn.hidden = !room.isHost;
    }
  }

  function renderVoteList() {
    if (!els.voteList || !window.CampfireChordViewer) return;
    var tally = tallyVotes(room.votes);
    var myVote = (room.votes || {})[myPresenceKey];
    els.voteList.innerHTML = "";
    window.CampfireChordViewer.listSongs().forEach(function (song) {
      var li = document.createElement("li");
      li.className = "groups-vote-row" + (myVote === song.id ? " is-voted" : "");

      var title = document.createElement("span");
      title.className = "groups-vote-row-title";
      title.textContent = song.title;
      li.appendChild(title);

      var count = document.createElement("span");
      var votes = tally.counts[song.id] || 0;
      count.className = "groups-vote-row-count";
      count.textContent = votes + (votes === 1 ? " vote" : " votes");
      li.appendChild(count);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "groups-vote-row-btn";
      btn.textContent = myVote === song.id ? "Voted" : "Vote";
      btn.addEventListener("click", function () { castVote(song.id); });
      li.appendChild(btn);

      els.voteList.appendChild(li);
    });
  }

  // ---- flows: create / join ---------------------------------------------
  function enterRoom(row, isHost, hostSecret) {
    myPresenceKey = randomToken();
    myLabel = isHost ? "Host" : randomLabel();
    iAmReady = false;
    room = {
      id: row.id,
      code: row.code,
      isHost: isHost,
      hostSecret: hostSecret || null,
      songId: row.song_id || null,
      status: row.status || "idle",
      startAt: row.start_at || null,
      pausedAtSec: row.paused_at_sec || 0,
      mode: row.mode || "host",
      votes: row.votes || {},
      votingOpen: !!row.voting_open
    };
    saveSession();
    renderPanel();
    subscribeToRoom();
    syncToRoomState();
  }

  function startCampfire(mode) {
    if (!isSupabaseReady()) return;
    closeModeModal();
    var code = randomCode();
    var secret = randomToken();
    createRoomRow(code, secret, mode)
      .then(function (row) {
        enterRoom(row, true, secret);
        // The host's own client is the one authoritative source for these
        // kickoff actions -- reusing the exact same RPCs a later Random
        // reshuffle / Vote round already uses, not a separate path.
        if (mode === "random") pickAndPushRandomSong();
        else if (mode === "vote") startVotingRound();
      })
      .catch(function () { window.alert("Couldn't start a campfire right now — check your connection and try again."); });
  }

  function joinCampfire(rawCode) {
    var code = (rawCode || "").trim().toUpperCase();
    if (!code) return;
    if (els.joinNotice) { els.joinNotice.hidden = true; }
    fetchRoomByCode(code)
      .then(function (row) {
        if (!row) throw new Error("not-found");
        if (isRoomExpired(row)) throw new Error("expired");
        closeJoinModal();
        enterRoom(row, false, null);
      })
      .catch(function (err) {
        if (!els.joinNotice) return;
        els.joinNotice.hidden = false;
        els.joinNotice.textContent = err && err.message === "expired"
          ? "That campfire has ended."
          : "Campfire not found — check the code and try again.";
      });
  }

  function openJoinModal() {
    if (els.joinNotice) els.joinNotice.hidden = true;
    if (els.joinForm) els.joinForm.reset();
    if (els.joinModal) {
      els.joinModal.classList.add("is-open");
      els.joinModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeJoinModal() {
    if (els.joinModal) {
      els.joinModal.classList.remove("is-open");
      els.joinModal.setAttribute("aria-hidden", "true");
    }
  }

  function openModeModal() {
    if (els.modeModal) {
      els.modeModal.classList.add("is-open");
      els.modeModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeModeModal() {
    if (els.modeModal) {
      els.modeModal.classList.remove("is-open");
      els.modeModal.setAttribute("aria-hidden", "true");
    }
  }

  // ---- reconnect on reload ------------------------------------------------
  function tryResumeSession() {
    var saved = loadSession();
    if (!saved) { renderEntry(); return; }
    fetchRoomById(saved.id)
      .then(function (row) {
        if (!row || isRoomExpired(row)) { clearSession(); renderEntry(); return; }
        myPresenceKey = saved.presenceKey || randomToken();
        myLabel = saved.label || (saved.isHost ? "Host" : randomLabel());
        iAmReady = false;
        room = {
          id: row.id,
          code: row.code,
          isHost: !!saved.isHost,
          hostSecret: saved.hostSecret || null,
          songId: row.song_id || null,
          status: row.status || "idle",
          startAt: row.start_at || null,
          pausedAtSec: row.paused_at_sec || 0,
          mode: row.mode || "host",
          votes: row.votes || {},
          votingOpen: !!row.voting_open
        };
        renderPanel();
        subscribeToRoom();
        syncToRoomState();
      })
      .catch(function () { renderEntry(); });
  }

  // ---- wiring --------------------------------------------------------------
  function wireUi() {
    if (els.startBtn) els.startBtn.addEventListener("click", openModeModal);
    if (els.joinBtn) els.joinBtn.addEventListener("click", openJoinModal);
    if (els.joinModal) {
      els.joinModal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
        btn.addEventListener("click", closeJoinModal);
      });
      els.joinModal.addEventListener("mousedown", function (e) {
        if (e.target === els.joinModal) closeJoinModal();
      });
    }
    if (els.modeModal) {
      els.modeModal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
        btn.addEventListener("click", closeModeModal);
      });
      els.modeModal.addEventListener("mousedown", function (e) {
        if (e.target === els.modeModal) closeModeModal();
      });
    }
    els.modeCards.forEach(function (card) {
      card.addEventListener("click", function () { startCampfire(card.dataset.mode); });
    });
    if (els.voteStartBtn) els.voteStartBtn.addEventListener("click", startVotingRound);
    if (els.voteFinalizeBtn) els.voteFinalizeBtn.addEventListener("click", finalizeVote);
    if (els.joinForm) {
      els.joinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        joinCampfire(els.joinCodeInput ? els.joinCodeInput.value : "");
      });
    }
    if (els.songSelect) {
      els.songSelect.addEventListener("change", function () {
        if (els.songSelect.value) selectSong(els.songSelect.value);
      });
    }
    if (els.readyToggle) {
      els.readyToggle.addEventListener("click", function () {
        iAmReady = !iAmReady;
        els.readyToggle.setAttribute("aria-pressed", iAmReady ? "true" : "false");
        els.readyToggle.textContent = iAmReady ? "✓ Ready" : "Mark as Ready";
        if (channel) channel.track({ label: myLabel, isHost: room.isHost, ready: iAmReady, joinedAt: Date.now() });
      });
    }
    if (els.startControl) els.startControl.addEventListener("click", startSong);
    if (els.pauseControl) els.pauseControl.addEventListener("click", pauseSong);
    if (els.resumeControl) els.resumeControl.addEventListener("click", resumeSong);
    if (els.leaveBtn) els.leaveBtn.addEventListener("click", leaveRoom);
    if (els.floatStart) els.floatStart.addEventListener("click", startSong);
    if (els.floatPause) els.floatPause.addEventListener("click", pauseSong);
    if (els.floatResume) els.floatResume.addEventListener("click", resumeSong);
    if (els.floatVoteStart) els.floatVoteStart.addEventListener("click", startVotingRound);
  }

  function isSupabaseReady() {
    // SUPABASE_CONFIGURED alone isn't enough -- the CDN script (loaded via
    // its own <script> tag before this file) can fail to load for reasons
    // that have nothing to do with configuration: an ad blocker, a
    // corporate firewall, or a network hiccup. Either way the graceful
    // fallback is the same "not set up" message, not a crash on first click.
    return SUPABASE_CONFIGURED && !!(window.supabase && window.supabase.createClient);
  }

  function init() {
    if (!$("groups")) return;
    cacheEls();
    if (!isSupabaseReady()) {
      if (els.notConfigured) els.notConfigured.hidden = false;
      if (els.entry) els.entry.hidden = true;
      return;
    }
    wireUi();
    if (window.CampfireChordViewer) window.CampfireChordViewer.onEnded(handleSongEnded);
    tryResumeSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
