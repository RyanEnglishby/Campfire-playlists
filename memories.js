(function () {
  "use strict";

  var STORAGE_KEY = "campfire-memories";
  var MAX_IMAGE_DIMENSION = 900;
  var IMAGE_QUALITY = 0.72;

  var els = {};
  // Two separate file inputs (camera-forcing vs. a plain picker) can't both
  // be "the" source of truth the way one input's .files was -- whichever
  // one last produced a file wins, tracked here instead.
  var selectedPhotoFile = null;

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.section = $("memories");
    els.grid = $("memories-grid");
    els.empty = $("memories-empty");
    els.openBtn = $("open-add-memory");
    els.modal = $("add-memory-modal");
    els.form = $("add-memory-form");
    els.notice = $("memory-form-notice");
    els.photoCameraBtn = $("memory-photo-camera-btn");
    els.photoGalleryBtn = $("memory-photo-gallery-btn");
    els.photoCameraInput = $("memory-photo-camera-input");
    els.photoGalleryInput = $("memory-photo-gallery-input");
    els.photoPreviewWrap = $("memory-photo-preview");
    els.photoPreviewImg = $("memory-photo-preview-img");
    els.songSelect = $("memory-song");
    els.captionInput = $("memory-caption");
    els.dateInput = $("memory-date");
    els.privacy = $("memories-privacy");
  }

  // ---- storage ----
  // Two backends behind the same shape. Signed-out visitors keep using
  // localStorage exactly as before. Signed-in visitors (see auth.js) read
  // and write the `memories` table instead (supabase/memories_schema.sql),
  // scoped to their own account by row-level security -- everything above
  // this layer (rendering, the add-memory form, delete) works the same
  // either way.
  var cloudUser = null;

  function isCloudMode() {
    return !!(cloudUser && window.CampfireSupabase && window.CampfireSupabase.isReady());
  }

  function loadMemoriesLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveMemoriesLocal(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false; // most likely quota exceeded
    }
  }

  function rowToMemory(row) {
    return {
      id: row.id,
      photo: row.photo,
      songTitle: row.song_title,
      caption: row.caption || "",
      date: row.memory_date || "",
      createdAt: new Date(row.created_at).getTime()
    };
  }

  function loadMemories() {
    if (!isCloudMode()) return Promise.resolve(loadMemoriesLocal());
    return window.CampfireSupabase.getClient()
      .from("memories")
      .select("*")
      .eq("user_id", cloudUser.id)
      .order("created_at", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(rowToMemory);
      });
  }

  function addMemory(memory) {
    if (!isCloudMode()) {
      var list = loadMemoriesLocal();
      list.push(memory);
      return saveMemoriesLocal(list) ? Promise.resolve(memory) : Promise.reject(new Error("local-quota"));
    }
    return window.CampfireSupabase.getClient()
      .from("memories")
      .insert({
        user_id: cloudUser.id,
        song_title: memory.songTitle,
        caption: memory.caption || null,
        memory_date: memory.date || null,
        photo: memory.photo
      })
      .select()
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return rowToMemory(res.data);
      });
  }

  // First sign-in on a device that already had local memories: move them
  // into the cloud once each. Tagging each one `migrated` (rather than, say,
  // clearing local storage, or just checking whether the cloud happens to
  // be empty) is what makes this safe on a shared/reused device: if a
  // *different* person signs in on this same browser later, their
  // migration only ever looks at local memories that are still untagged --
  // someone else's already-migrated ones are never re-offered or copied
  // into a second account. Local storage itself is left alone either way,
  // so signed-out visitors keep seeing their own local history.
  function migrateLocalIfNeeded() {
    var local = loadMemoriesLocal();
    var unmigrated = local.filter(function (m) { return !m.migrated; });
    if (!unmigrated.length) return Promise.resolve();
    var ordered = unmigrated.slice().sort(function (a, b) { return a.createdAt - b.createdAt; });
    return ordered.reduce(function (chain, memory) {
      return chain.then(function () {
        return addMemory(memory).then(function () { memory.migrated = true; });
      });
    }, Promise.resolve()).then(function () {
      saveMemoriesLocal(local);
    }).catch(function () {
      // best-effort -- whatever succeeded above is already tagged, so it
      // won't be re-uploaded next time; save that partial progress and
      // leave the rest to be picked up on the next sign-in.
      saveMemoriesLocal(local);
    });
  }

  function updatePrivacyNotice() {
    if (!els.privacy) return;
    els.privacy.textContent = isCloudMode()
      ? "Synced to your account — visible on any device you sign in on."
      : "Stored only on this device/browser — nothing is uploaded anywhere.";
  }

  function handleAuthChange(user) {
    cloudUser = user;
    updatePrivacyNotice();
    if (user) {
      migrateLocalIfNeeded().then(renderMemories);
    } else {
      renderMemories();
    }
  }

  // ---- gathering the real song list from the page itself, not a copy ----
  function collectSongTitles() {
    var titles = [];
    document.querySelectorAll(".track-title").forEach(function (el) {
      titles.push(el.textContent.trim());
    });
    document.querySelectorAll(".feature-text h2").forEach(function (el) {
      titles.push(el.textContent.trim());
    });
    var seen = {};
    var unique = [];
    titles.forEach(function (t) {
      if (t && !seen[t]) { seen[t] = true; unique.push(t); }
    });
    unique.sort(function (a, b) { return a.localeCompare(b); });
    return unique;
  }

  function populateSongSelect() {
    var titles = collectSongTitles();
    titles.forEach(function (title) {
      var opt = document.createElement("option");
      opt.value = title;
      opt.textContent = title;
      els.songSelect.appendChild(opt);
    });
  }

  // ---- image compression: resize to a max edge + re-encode as JPEG so a
  // handful of memories doesn't blow through localStorage's ~5-10MB quota ----
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
            if (w >= h) { h = Math.round(h * (MAX_IMAGE_DIMENSION / w)); w = MAX_IMAGE_DIMENSION; }
            else { w = Math.round(w * (MAX_IMAGE_DIMENSION / h)); h = MAX_IMAGE_DIMENSION; }
          }
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          try {
            resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = function () { reject(new Error("unreadable image")); };
        img.src = e.target.result;
      };
      reader.onerror = function () { reject(new Error("unreadable file")); };
      reader.readAsDataURL(file);
    });
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  // ---- rendering: built with createElement/textContent throughout, never
  // innerHTML, so a caption typed by a visitor can never be interpreted as
  // markup ----
  function renderMemories() {
    loadMemories().then(function (list) {
      els.grid.innerHTML = "";

      if (list.length === 0) {
        els.empty.hidden = false;
        els.grid.hidden = true;
        return;
      }
      els.empty.hidden = true;
      els.grid.hidden = false;

      list.slice().reverse().forEach(function (memory) {
        els.grid.appendChild(buildMemoryCard(memory));
      });
    }).catch(function () {
      // Cloud fetch failed (network blip) -- show the empty state rather
      // than crash. Local data, if any, is never touched by this, and the
      // next successful render picks up right where the cloud is.
      els.empty.hidden = false;
      els.grid.hidden = true;
    });
  }

  function buildMemoryCard(memory) {
    var card = document.createElement("article");
    card.className = "memory-card";
    card.style.setProperty("--tilt", ((memory.id.charCodeAt(0) % 5) - 2) + "deg");

    var photoWrap = document.createElement("div");
    photoWrap.className = "memory-photo";
    var img = document.createElement("img");
    img.src = memory.photo;
    img.alt = "";
    img.loading = "lazy";
    photoWrap.appendChild(img);
    card.appendChild(photoWrap);

    var info = document.createElement("div");
    info.className = "memory-info";

    var song = document.createElement("p");
    song.className = "memory-song";
    song.textContent = memory.songTitle;
    info.appendChild(song);

    if (memory.caption) {
      var caption = document.createElement("p");
      caption.className = "memory-caption";
      caption.textContent = memory.caption;
      info.appendChild(caption);
    }

    if (memory.date) {
      var date = document.createElement("p");
      date.className = "memory-date";
      date.textContent = formatDate(memory.date);
      info.appendChild(date);
    }

    card.appendChild(info);

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "memory-delete";
    deleteBtn.setAttribute("aria-label", "Delete this memory");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.addEventListener("click", function () { deleteMemory(memory.id); });
    card.appendChild(deleteBtn);

    return card;
  }

  function deleteMemory(id) {
    var op = isCloudMode()
      ? window.CampfireSupabase.getClient().from("memories").delete().eq("id", id).eq("user_id", cloudUser.id)
          .then(function (res) { if (res.error) throw res.error; })
      : Promise.resolve(saveMemoriesLocal(loadMemoriesLocal().filter(function (m) { return m.id !== id; })));
    op.catch(function () { /* network blip -- the item just reappears on render below */ })
      .then(renderMemories);
  }

  // ---- add-memory modal ----
  function openModal() {
    els.modal.__lastFocused = document.activeElement;
    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("site-modal-open");
  }

  function closeModal() {
    els.modal.classList.remove("is-open");
    els.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("site-modal-open");
    if (els.modal.__lastFocused && typeof els.modal.__lastFocused.focus === "function") {
      els.modal.__lastFocused.focus();
    }
  }

  function setNotice(message) {
    els.notice.textContent = message || "";
    els.notice.hidden = !message;
  }

  function resetForm() {
    els.form.reset();
    selectedPhotoFile = null;
    setNotice("");
    els.photoPreviewWrap.hidden = true;
    els.photoPreviewImg.src = "";
  }

  function wireModal() {
    els.openBtn.addEventListener("click", function () {
      resetForm();
      openModal();
    });
    els.modal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    els.modal.addEventListener("mousedown", function (e) {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.modal.classList.contains("is-open")) closeModal();
    });

    // Two explicit actions instead of one input relying on `capture` to
    // decide -- "Take Photo" forces the camera, "Choose from Camera Roll"
    // opens the normal picker. Both feed the same preview/selection state.
    els.photoCameraBtn.addEventListener("click", function () { els.photoCameraInput.click(); });
    els.photoGalleryBtn.addEventListener("click", function () { els.photoGalleryInput.click(); });

    function handlePhotoPicked(input) {
      var file = input.files && input.files[0];
      if (!file) return;
      selectedPhotoFile = file;
      var reader = new FileReader();
      reader.onload = function (e) {
        els.photoPreviewImg.src = e.target.result;
        els.photoPreviewWrap.hidden = false;
      };
      reader.readAsDataURL(file);
    }
    els.photoCameraInput.addEventListener("change", function () { handlePhotoPicked(els.photoCameraInput); });
    els.photoGalleryInput.addEventListener("change", function () { handlePhotoPicked(els.photoGalleryInput); });

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();

      var file = selectedPhotoFile;
      var songTitle = els.songSelect.value;
      if (!file) { setNotice("Choose a photo first."); return; }
      if (!songTitle) { setNotice("Choose which song this memory goes with."); return; }

      var submitBtn = els.form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setNotice("Saving…");

      compressImage(file).then(function (dataUrl) {
        var memory = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          photo: dataUrl,
          songTitle: songTitle,
          caption: els.captionInput.value.trim(),
          date: els.dateInput.value || "",
          createdAt: Date.now()
        };
        addMemory(memory).then(function () {
          if (submitBtn) submitBtn.disabled = false;
          renderMemories();
          closeModal();
        }).catch(function (err) {
          if (submitBtn) submitBtn.disabled = false;
          setNotice(err && err.message === "local-quota"
            ? "Couldn't save — this device may be out of storage. Try deleting an older memory first."
            : "Couldn't save — check your connection and try again.");
        });
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        setNotice("Couldn't read that photo — try a different one.");
      });
    });
  }

  function init() {
    if (!$("memories")) return; // this page doesn't have the Memories section
    cacheEls();
    populateSongSelect();
    if (window.CampfireAuth) {
      cloudUser = window.CampfireAuth.getUser();
      window.CampfireAuth.onChange(handleAuthChange);
    }
    updatePrivacyNotice();
    renderMemories();
    wireModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
