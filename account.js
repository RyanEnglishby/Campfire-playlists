// Camp Chord -- the account page (account.html). A small state machine:
// loading -> (not-configured | signed-out | pending-confirmation | signed-in),
// plus password-recovery, which only account.js ever shows (see the
// PASSWORD_RECOVERY handling note in auth.js).
(function () {
  "use strict";

  var els = {};

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    els.loading = $("account-loading");
    els.notConfigured = $("account-not-configured");
    els.signedOut = $("account-signedout");
    els.pending = $("account-pending");
    els.recovery = $("account-recovery");
    els.profile = $("account-profile");

    els.tabLogin = $("account-tab-login");
    els.tabSignup = $("account-tab-signup");
    els.loginForm = $("account-login-form");
    els.signupForm = $("account-signup-form");
    els.forgotForm = $("account-forgot-form");
    els.forgotLink = $("account-forgot-link");
    els.backToLoginLink = $("account-back-to-login-link");

    els.loginEmail = $("account-login-email");
    els.loginPassword = $("account-login-password");
    els.loginNotice = $("account-login-notice");

    els.signupEmail = $("account-signup-email");
    els.signupPassword = $("account-signup-password");
    els.signupPasswordConfirm = $("account-signup-password-confirm");
    els.signupNotice = $("account-signup-notice");

    els.forgotEmail = $("account-forgot-email");
    els.forgotNotice = $("account-forgot-notice");

    els.pendingEmail = $("account-pending-email");

    els.recoveryForm = $("account-recovery-form");
    els.recoveryPassword = $("account-recovery-password");
    els.recoveryPasswordConfirm = $("account-recovery-password-confirm");
    els.recoveryNotice = $("account-recovery-notice");

    els.profileEmail = $("account-profile-email");
    els.profileSince = $("account-profile-since");
    els.profileAvatar = $("account-avatar");
    els.signoutBtn = $("account-signout-btn");
  }

  function setState(name) {
    els.loading.hidden = true;
    els.notConfigured.hidden = name !== "not-configured";
    els.signedOut.hidden = name !== "signed-out";
    els.pending.hidden = name !== "pending";
    els.recovery.hidden = name !== "recovery";
    els.profile.hidden = name !== "signed-in";
  }

  function showLoginTab() {
    els.tabLogin.classList.add("is-active");
    els.tabLogin.setAttribute("aria-selected", "true");
    els.tabSignup.classList.remove("is-active");
    els.tabSignup.setAttribute("aria-selected", "false");
    els.loginForm.hidden = false;
    els.signupForm.hidden = true;
    els.forgotForm.hidden = true;
  }
  function showSignupTab() {
    els.tabSignup.classList.add("is-active");
    els.tabSignup.setAttribute("aria-selected", "true");
    els.tabLogin.classList.remove("is-active");
    els.tabLogin.setAttribute("aria-selected", "false");
    els.signupForm.hidden = false;
    els.loginForm.hidden = true;
    els.forgotForm.hidden = true;
  }
  function showForgotForm() {
    els.forgotForm.hidden = false;
    els.loginForm.hidden = true;
    els.signupForm.hidden = true;
  }

  function setNotice(el, message, isError) {
    el.textContent = message || "";
    el.hidden = !message;
    el.classList.toggle("is-error", !!isError);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function friendlyError(error) {
    var msg = (error && error.message) || "";
    if (/already registered|already exists/i.test(msg)) return "An account with that email already exists.";
    if (/invalid login credentials/i.test(msg)) return "Wrong email or password.";
    if (/email not confirmed/i.test(msg)) return "Confirm your email first — check your inbox for the link.";
    if (/password.*(least|short|weak)/i.test(msg)) return "Choose a longer password (at least 6 characters).";
    if (/invalid.*email|unable to validate email/i.test(msg)) return "That doesn't look like a valid email address.";
    if (/rate limit|too many/i.test(msg)) return "Too many attempts — wait a moment and try again.";
    if (/user not found|no user found/i.test(msg)) return "We couldn't find an account with that email.";
    return msg || "Something went wrong.";
  }

  function renderProfile(user) {
    els.profileEmail.textContent = user.email;
    els.profileAvatar.textContent = (user.email || "?").charAt(0).toUpperCase();
    els.profileSince.textContent = user.created_at ? "Member since " + formatDate(user.created_at) : "";
  }

  // Reflects whatever CampfireAuth currently knows -- called after every
  // genuine sign-in/out transition. Password recovery is never entered
  // this way (see onPasswordRecovery below); once a recovery session
  // successfully sets a new password, the SDK's own follow-up event
  // naturally lands here too, and the signed-in branch is exactly right.
  function refresh() {
    var user = window.CampfireAuth.getUser();
    if (user) {
      renderProfile(user);
      setState("signed-in");
    } else {
      setState("signed-out");
      showLoginTab();
    }
  }

  function wireTabs() {
    els.tabLogin.addEventListener("click", showLoginTab);
    els.tabSignup.addEventListener("click", showSignupTab);
    els.forgotLink.addEventListener("click", showForgotForm);
    els.backToLoginLink.addEventListener("click", showLoginTab);
  }

  function wireForms() {
    els.loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = els.loginEmail.value.trim();
      var password = els.loginPassword.value;
      var btn = els.loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      setNotice(els.loginNotice, "Logging in…");
      window.CampfireAuth.signIn(email, password).then(function (res) {
        btn.disabled = false;
        if (res.error) setNotice(els.loginNotice, friendlyError(res.error), true);
      }).catch(function () {
        btn.disabled = false;
        setNotice(els.loginNotice, "Couldn't log in — check your connection and try again.", true);
      });
    });

    els.signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = els.signupEmail.value.trim();
      var password = els.signupPassword.value;
      if (password !== els.signupPasswordConfirm.value) {
        setNotice(els.signupNotice, "Passwords don't match.", true);
        return;
      }
      var btn = els.signupForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      setNotice(els.signupNotice, "Creating your account…");
      window.CampfireAuth.signUp(email, password).then(function (res) {
        btn.disabled = false;
        if (res.error) { setNotice(els.signupNotice, friendlyError(res.error), true); return; }
        if (res.data && res.data.session) return; // confirm-email is off -- refresh() via onChange handles it
        els.pendingEmail.textContent = email;
        setState("pending");
      }).catch(function () {
        btn.disabled = false;
        setNotice(els.signupNotice, "Couldn't create that account — check your connection and try again.", true);
      });
    });

    els.forgotForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = els.forgotEmail.value.trim();
      var btn = els.forgotForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      setNotice(els.forgotNotice, "Sending…");
      window.CampfireAuth.requestPasswordReset(email).then(function (res) {
        btn.disabled = false;
        if (res.error) { setNotice(els.forgotNotice, friendlyError(res.error), true); return; }
        setNotice(els.forgotNotice, "Check " + email + " for a reset link.");
      }).catch(function () {
        btn.disabled = false;
        setNotice(els.forgotNotice, "Couldn't send that link — check your connection and try again.", true);
      });
    });

    els.recoveryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var password = els.recoveryPassword.value;
      if (password !== els.recoveryPasswordConfirm.value) {
        setNotice(els.recoveryNotice, "Passwords don't match.", true);
        return;
      }
      var btn = els.recoveryForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      setNotice(els.recoveryNotice, "Saving…");
      window.CampfireAuth.setNewPassword(password).then(function (res) {
        btn.disabled = false;
        if (res.error) setNotice(els.recoveryNotice, friendlyError(res.error), true);
        // on success, the SDK's own follow-up event reaches refresh() via
        // onChange and moves to the signed-in state
      }).catch(function () {
        btn.disabled = false;
        setNotice(els.recoveryNotice, "Couldn't set that password — check your connection and try again.", true);
      });
    });

    els.signoutBtn.addEventListener("click", function () {
      els.signoutBtn.disabled = true;
      window.CampfireAuth.signOut().finally(function () {
        els.signoutBtn.disabled = false;
      });
    });
  }

  function init() {
    cacheEls();
    if (!window.CampfireSupabase || !window.CampfireSupabase.isReady()) {
      setState("not-configured");
      return;
    }
    wireTabs();
    wireForms();
    window.CampfireAuth.onChange(refresh);
    window.CampfireAuth.onPasswordRecovery(function () { setState("recovery"); });

    // Safety net: the SDK's first auth event (reporting whatever session,
    // or lack of one, it finds) normally arrives almost instantly. If that
    // never happens -- a stalled request while it tries to restore a
    // stored session, rather than a clean error -- nothing else here will
    // ever move the page off "Loading...". Time out into the signed-out
    // form instead of leaving a visitor staring at a spinner forever; if
    // the real auth state does still arrive after this fires, refresh()
    // (already subscribed above) corrects it whenever it does.
    window.setTimeout(function () {
      if (els.loading && !els.loading.hidden) {
        setState("signed-out");
        showLoginTab();
        if (els.signedOut) {
          var notice = document.createElement("p");
          notice.className = "account-notice is-error";
          notice.style.textAlign = "center";
          notice.style.margin = "0 0 16px";
          notice.textContent = "Taking longer than expected to reach the server. You can still try signing in below.";
          els.signedOut.insertBefore(notice, els.signedOut.firstChild);
        }
      }
    }, 6000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
