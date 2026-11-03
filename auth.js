// Camp Chord accounts -- the one site-wide auth system.
//
// Email + password via Supabase Auth (signUp/signInWithPassword, plus
// forgot/reset-password and sign-out). This file only owns the session
// itself and a couple of small, reusable primitives -- the actual sign-up/
// login/reset UI lives in account.js (account.html), which is the one place
// a visitor actually authenticates. Every other feature (Memories, Groups,
// the per-song features in script.js) just asks this file "who's signed in"
// and "tell me when that changes."
//
// Uses the shared Supabase client (supabase-client.js) -- if Supabase isn't
// reachable at all, everything here degrades to "nobody's signed in" and
// every feature's own local-only fallback keeps working untouched.
(function () {
  "use strict";

  var currentUser = null;
  var changeListeners = [];
  var recoveryListeners = [];

  function getClient() {
    return window.CampfireSupabase ? window.CampfireSupabase.getClient() : null;
  }

  // Always account.html, regardless of which page a call happens to be made
  // from -- resolved against the current directory so this works the same
  // on GitHub Pages (a subpath) and a local dev server (the root).
  function accountPageUrl() {
    return window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "account.html";
  }

  function onAccountPage() {
    return /(^|\/)account\.html$/.test(window.location.pathname);
  }

  // Auth redirects return with #access_token=...&refresh_token=...&type=...
  // in the URL -- the SDK consumes it automatically, but leaving tokens
  // sitting in the address bar/history afterward is untidy and mildly
  // risky. Strip it once it's been read, whatever kind of redirect it was.
  function cleanAuthHash() {
    if (window.location.hash.indexOf("access_token") === -1) return;
    var clean = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", clean);
  }

  // PASSWORD_RECOVERY carries a real session too (clicking a reset-password
  // email link signs you in, same as a magic link always has) -- but a
  // visitor who just clicked "reset my password" has not asked to sign
  // into every feature on the site, only to set a new password. Routing it
  // to a separate listener (only account.js subscribes) instead of
  // `changeListeners` (which memories.js and friends subscribe to) is what
  // stops a mid-reset session from silently triggering, say, Memories'
  // sign-in/migrate logic in a tab the visitor never asked to sign into --
  // the same class of cross-user bug already caught once this session,
  // guarded against here from the start instead.
  function handleAuthChange(event, session) {
    var user = (session && session.user) || null;

    if (event === "PASSWORD_RECOVERY") {
      recoveryListeners.forEach(function (fn) { fn(user); });
      if (!onAccountPage()) window.location.href = accountPageUrl();
      return;
    }

    currentUser = user;
    if (event === "SIGNED_IN" || event === "SIGNED_UP") cleanAuthHash();
    changeListeners.forEach(function (fn) { fn(currentUser); });
  }

  // Site-wide "Sign in" / account pill -- present on every page that
  // includes this markup (not just account.html), so the account system is
  // reachable from anywhere rather than only discoverable by stumbling into
  // a gated feature. Degrades to nothing if the markup isn't on the page.
  function renderAuthWidget(user) {
    var link = document.getElementById("auth-widget-link");
    if (!link) return;
    if (user) {
      link.textContent = (user.email || "?").charAt(0).toUpperCase();
      link.title = user.email || "";
      link.setAttribute("aria-label", "Account: " + (user.email || ""));
      link.classList.add("is-signed-in");
    } else {
      link.textContent = "Sign in";
      link.title = "";
      link.removeAttribute("aria-label");
      link.classList.remove("is-signed-in");
    }
  }

  function init() {
    renderAuthWidget(currentUser);
    changeListeners.push(renderAuthWidget);

    var client = getClient();
    if (!client) return; // Supabase unreachable -- every feature's local fallback takes over
    client.auth.onAuthStateChange(handleAuthChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ---- shared "sign in to use this" prompt -----------------------------
  // One implementation so Memories, Favourites, Learning progress, and
  // Practice history don't each grow their own slightly-different copy.
  function renderGate(container, message) {
    if (!container) return;
    container.innerHTML = "";
    var p = document.createElement("p");
    p.className = "auth-gate";
    p.textContent = (message || "Sign in to use this.") + " ";
    var link = document.createElement("a");
    link.className = "auth-gate-link";
    link.href = "account.html";
    link.textContent = "Sign in";
    p.appendChild(link);
    container.appendChild(p);
  }

  window.CampfireAuth = {
    getUser: function () { return currentUser; },
    // Genuine sign-in/sign-out transitions only -- see handleAuthChange.
    onChange: function (fn) { if (typeof fn === "function") changeListeners.push(fn); },
    // Fires only on account.html, only mid-password-reset.
    onPasswordRecovery: function (fn) { if (typeof fn === "function") recoveryListeners.push(fn); },
    renderGate: renderGate,

    signUp: function (email, password) {
      var client = getClient();
      if (!client) return Promise.reject(new Error("not-configured"));
      return client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: accountPageUrl() } });
    },
    signIn: function (email, password) {
      var client = getClient();
      if (!client) return Promise.reject(new Error("not-configured"));
      return client.auth.signInWithPassword({ email: email, password: password });
    },
    requestPasswordReset: function (email) {
      var client = getClient();
      if (!client) return Promise.reject(new Error("not-configured"));
      return client.auth.resetPasswordForEmail(email, { redirectTo: accountPageUrl() });
    },
    setNewPassword: function (password) {
      var client = getClient();
      if (!client) return Promise.reject(new Error("not-configured"));
      return client.auth.updateUser({ password: password });
    },
    signOut: function () {
      var client = getClient();
      return client ? client.auth.signOut() : Promise.resolve();
    }
  };
})();
