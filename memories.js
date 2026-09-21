(function () {
  "use strict";

  var STORAGE_KEY = "campfire-memories";
  var MAX_IMAGE_DIMENSION = 900;
  var IMAGE_QUALITY = 0.72;

  var els = {};

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.section = $("memories");
    els.grid = $("memories-grid");
    els.empty = $("memories-empty");
    els.openBtn = $("open-add-memory");
    els.modal = $("add-memory-modal");
    els.form = $("add-memory-form");
    els.notice = $("memory-form-notice");
    els.photoInput = $("memory-photo");
    els.photoPreviewWrap = $("memory-photo-preview");
    els.photoPreviewImg = $("memory-photo-preview-img");
    els.songSelect = $("memory-song");
    els.captionInput = $("memory-caption");
    els.dateInput = $("memory-date");
  }

  // ---- storage ----
  function loadMemories() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveMemories(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false; // most likely quota exceeded
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
    var list = loadMemories();
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
    var list = loadMemories().filter(function (m) { return m.id !== id; });
    saveMemories(list);
    renderMemories();
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

    els.photoInput.addEventListener("change", function () {
      var file = els.photoInput.files && els.photoInput.files[0];
      if (!file) { els.photoPreviewWrap.hidden = true; return; }
      var reader = new FileReader();
      reader.onload = function (e) {
        els.photoPreviewImg.src = e.target.result;
        els.photoPreviewWrap.hidden = false;
      };
      reader.readAsDataURL(file);
    });

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();

      var file = els.photoInput.files && els.photoInput.files[0];
      var songTitle = els.songSelect.value;
      if (!file) { setNotice("Choose a photo first."); return; }
      if (!songTitle) { setNotice("Choose which song this memory goes with."); return; }

      var submitBtn = els.form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setNotice("Saving…");

      compressImage(file).then(function (dataUrl) {
        var list = loadMemories();
        var memory = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          photo: dataUrl,
          songTitle: songTitle,
          caption: els.captionInput.value.trim(),
          date: els.dateInput.value || "",
          createdAt: Date.now()
        };
        list.push(memory);
        var ok = saveMemories(list);
        if (submitBtn) submitBtn.disabled = false;
        if (!ok) {
          setNotice("Couldn't save — this device may be out of storage. Try deleting an older memory first.");
          return;
        }
        renderMemories();
        closeModal();
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
    renderMemories();
    wireModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
