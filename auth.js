// Camp Chord -- sign in (so Memories can sync across devices).
//
// Passwordless: a visitor types their email, gets a one-time magic link,
// clicking it signs them in. No password to set, forget, or reset. Lives
// entirely inside the Memories section since syncing Memories is the only
// thing being signed in actually does right now -- see memories.js.
//
// Uses the shared Supabase client (supabase-client.js) -- if Supabase isn't
// reachable at all, the whole account bar just stays hidden and Memories
// keeps working exactly as it always has, stored only on this device.
(function () {
  "use strict";

  var els = {};
  var changeListeners = [];
  var currentUser = null;

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.account = $("memories-account");
    els.signinForm = $("memories-signin-form");
    els.emailInput = $("memories-signin-email");
    els.notice = $("memories-account-notice");
    els.signedIn = $("memories-account-signedin");
    els.emailDisplay = $("memories-account-email");
    els.signoutBtn = $("memories-signout-btn");
  }

  function setNotice(message, isError) {
    if (!els.notice) return;
    els.notice.textContent = message || "";
    els.notice.hidden = !message;
    els.notice.classList.toggle("is-error", !!isError);
  }

  function updateUi() {
    if (!els.account) return;
    var signedIn = !!currentUser;
    if (els.signinForm) els.signinForm.hidden = signedIn;
    if (els.signedIn) els.signedIn.hidden = !signedIn;
    if (signedIn && els.emailDisplay) {
      els.emailDisplay.textContent = "Signed in as " + currentUser.email;
    }
  }

  // Magic links return with #access_token=...&refresh_token=...&... in the
  // URL -- the SDK consumes it automatically, but leaving the tokens
  // sitting in the address bar/history afterward is just untidy and
  // mildly risky. Strip it once it's been read.
  function cleanAuthHash() {
    if (window.location.hash.indexOf("access_token") === -1) return;
    var clean = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", clean);
  }

  function handleAuthChange(event, session) {
    currentUser = (session && session.user) || null;
    if (event === "SIGNED_IN") cleanAuthHash();
    updateUi();
    if (event === "SIGNED_IN") setNotice("");
    changeListeners.forEach(function (fn) { fn(currentUser); });
  }

  function sendMagicLink(email) {
    var client = window.CampfireSupabase.getClient();
    var redirectTo = window.location.origin + window.location.pathname;
    var submitBtn = els.signinForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setNotice("Sending…");

    client.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    }).then(function (res) {
      if (submitBtn) submitBtn.disabled = false;
      if (res.error) {
        setNotice("Couldn't send that link" + (res.error.message ? " (" + res.error.message + ")" : "") + ".", true);
        return;
      }
      setNotice("Check " + email + " for a sign-in link.");
    }).catch(function () {
      if (submitBtn) submitBtn.disabled = false;
      setNotice("Couldn't send that link — check your connection and try again.", true);
    });
  }

  function wireUi() {
    if (els.signinForm) {
      els.signinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (els.emailInput.value || "").trim();
        if (!email) return;
        sendMagicLink(email);
      });
    }
    if (els.signoutBtn) {
      els.signoutBtn.addEventListener("click", function () {
        var client = window.CampfireSupabase.getClient();
        els.signoutBtn.disabled = true;
        client.auth.signOut().finally(function () {
          els.signoutBtn.disabled = false;
        });
      });
    }
  }

  function init() {
    cacheEls();
    if (!els.account) return; // this page doesn't have Memories
    if (!window.CampfireSupabase || !window.CampfireSupabase.isReady()) return; // stays hidden

    els.account.hidden = false;
    wireUi();

    var client = window.CampfireSupabase.getClient();
    client.auth.onAuthStateChange(handleAuthChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.CampfireAuth = {
    getUser: function () { return currentUser; },
    onChange: function (fn) { if (typeof fn === "function") changeListeners.push(fn); },
    signOut: function () {
      var client = window.CampfireSupabase && window.CampfireSupabase.getClient();
      return client ? client.auth.signOut() : Promise.resolve();
    }
  };
})();
