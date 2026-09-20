(function () {
  "use strict";

  // TODO(site owner): put the real inbox that should receive these here.
  // Until this contains an "@", the forms will say so instead of silently
  // trying to send anywhere.
  var CONTACT_EMAIL = "CampChord@gmail.com";
  var EMAIL_CONFIGURED = CONTACT_EMAIL.indexOf("@") !== -1;

  // Optional: a Formspree form endpoint (https://formspree.io) makes Submit
  // send immediately with no email app involved. Until this is set, forms
  // fall back to the mailto behavior above -- both are always honest about
  // which one actually happened.
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE-WITH-YOUR-FORM-ID";
  var FORMSPREE_CONFIGURED = FORMSPREE_ENDPOINT.indexOf("REPLACE-WITH-YOUR-FORM-ID") === -1;

  var NOT_CONFIGURED_MSG = "This form isn't connected to an email address yet, so nothing can send. (Site owner: set CONTACT_EMAIL in contact.js.)";

  function $(id) { return document.getElementById(id); }

  // Passively remembers the last song sheet that was open, so a bug report
  // filed from the footer (the chord viewer has to be closed to reach it)
  // can still be pre-filled with what the visitor was just looking at.
  var lastOpenSong = "";
  function observeChordViewer() {
    var viewer = document.getElementById("chord-viewer");
    if (!viewer || typeof MutationObserver === "undefined") return;
    var mo = new MutationObserver(function () {
      if (viewer.classList.contains("is-open")) {
        var title = document.getElementById("chord-title");
        lastOpenSong = title ? title.textContent.trim() : "";
      }
    });
    mo.observe(viewer, { attributes: true, attributeFilter: ["class"] });
  }

  function buildMailto(subject, body) {
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  // Formspree when configured (submits immediately, no email app); otherwise
  // falls back to the existing mailto behavior. Every path ends by telling
  // the visitor exactly what actually happened.
  function submitViaFormspreeOrMailto(form, subject, body, replyToEmail) {
    if (FORMSPREE_CONFIGURED) {
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setNotice(form, "Sending…");

      var payload = { _subject: subject, message: body };
      if (replyToEmail) payload._replyto = replyToEmail;

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (submitBtn) submitBtn.disabled = false;
        if (res.ok) {
          form.reset();
          setNotice(form, "Sent — thanks! We'll get back to you if you left an email.");
        } else if (EMAIL_CONFIGURED) {
          setNotice(form, "Couldn't send that directly, so opening your email app instead…");
          window.location.href = buildMailto(subject, body);
        } else {
          setNotice(form, "Couldn't send that directly, and no email fallback is configured either.");
        }
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (EMAIL_CONFIGURED) {
          setNotice(form, "Couldn't reach the server, so opening your email app instead…");
          window.location.href = buildMailto(subject, body);
        } else {
          setNotice(form, "Couldn't reach the server, and no email fallback is configured either.");
        }
      });
    } else if (EMAIL_CONFIGURED) {
      window.location.href = buildMailto(subject, body);
      setNotice(form, "Opening your email app with these details filled in…");
    } else {
      setNotice(form, NOT_CONFIGURED_MSG);
    }
  }

  function setNotice(form, message) {
    var notice = form.querySelector(".contact-form-notice");
    if (!notice) return;
    notice.textContent = message || "";
    notice.hidden = !message;
  }

  function openModal(modal, focusEl) {
    modal.__lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("site-modal-open");
    if (focusEl && typeof focusEl.focus === "function") focusEl.focus();
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("site-modal-open");
    if (modal.__lastFocused && typeof modal.__lastFocused.focus === "function") modal.__lastFocused.focus();
  }

  function wireModalChrome(modal) {
    modal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { closeModal(modal); });
    });
    modal.addEventListener("mousedown", function (e) {
      if (e.target === modal) closeModal(modal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(modal);
    });
  }

  function initRequestForm() {
    var modal = $("request-song-modal");
    var form = $("request-song-form");
    var opener = $("open-request-song");
    if (!modal || !form || !opener) return;
    wireModalChrome(modal);

    opener.addEventListener("click", function () {
      form.reset();
      setNotice(form, "");
      openModal(modal, $("request-song-title"));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var title = $("request-song-title").value.trim();
      var artist = $("request-song-artist").value.trim();
      var name = $("request-song-name").value.trim();
      var email = $("request-song-email").value.trim();
      var note = $("request-song-note").value.trim();
      if (!title || !artist) { setNotice(form, "Song title and artist are both required."); return; }
      if (!EMAIL_CONFIGURED) { setNotice(form, NOT_CONFIGURED_MSG); return; }

      var subject = "Song Request — " + title + " by " + artist;
      var body = [
        "Song title: " + title,
        "Artist: " + artist,
        "From: " + (name || "(not given)"),
        "Reply-to email: " + (email || "(not given)"),
        "",
        "Message:",
        note || "(none)"
      ].join("\n");

      submitViaFormspreeOrMailto(form, subject, body, email);
    });
  }

  function initBugForm() {
    var modal = $("report-bug-modal");
    var form = $("report-bug-form");
    var opener = $("open-report-bug");
    if (!modal || !form || !opener) return;
    wireModalChrome(modal);

    opener.addEventListener("click", function () {
      form.reset();
      setNotice(form, "");
      var songField = $("report-bug-song");
      if (songField) songField.value = lastOpenSong;
      var autoNote = $("report-bug-autonote");
      if (autoNote) {
        autoNote.textContent = "Automatically included: this page’s address and your browser's info.";
      }
      openModal(modal, $("report-bug-what"));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var what = $("report-bug-what").value.trim();
      var song = $("report-bug-song").value.trim();
      var device = $("report-bug-device").value.trim();
      var email = $("report-bug-email").value.trim();
      if (!what) { setNotice(form, "Please describe what went wrong."); return; }
      if (!EMAIL_CONFIGURED) { setNotice(form, NOT_CONFIGURED_MSG); return; }

      var subject = "Bug Report — Campfire Songs";
      var body = [
        "What went wrong: " + what,
        "Song affected: " + (song || "(not given)"),
        "Device/browser (as described): " + (device || "(not given)"),
        "Reply-to email: " + (email || "(not given)"),
        "",
        "Auto-included:",
        "Page: " + window.location.href,
        "User agent: " + navigator.userAgent
      ].join("\n");

      submitViaFormspreeOrMailto(form, subject, body, email);
    });
  }

  function initFeedbackLink() {
    var link = $("general-feedback-link");
    var hint = $("contact-hint");
    if (!link) return;
    link.addEventListener("click", function (e) {
      if (EMAIL_CONFIGURED) return; // let the real mailto href fire
      e.preventDefault();
      if (hint) { hint.textContent = NOT_CONFIGURED_MSG; hint.hidden = false; }
    });
    if (EMAIL_CONFIGURED) {
      link.href = buildMailto("Campfire Songs — Feedback", "");
    }
  }

  function init() {
    observeChordViewer();
    initRequestForm();
    initBugForm();
    initFeedbackLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
