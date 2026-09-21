# Campfire Council Memory

This file stores the conclusions from repeated Believer / Skeptic / Investor / Judge reviews of the Campfire idea.

For every Council run, append entries in this format:

## [DATE] — Campfire Songs
Agent: [Believer / Skeptic / Investor / Judge]
Position: [one-line conclusion]
Key claim: [single most important claim]

Do not delete previous entries.

## 2026-09-20 — Campfire Songs
Agent: Skeptic
Position: Kill the business case — the product may be a fine hobby project, but every feature is already free and bigger elsewhere, and monetization is gated on a licensing process nobody is pursuing.
Key claim: Ultimate Guitar, Chordify, and GuitarTuna already give away (free, at far greater scale) every feature in this pitch — auto-scroll, timed highlighting, chord diagrams, and tuning — so Campfire has no differentiated reason to convert a free user into a paying one.

## 2026-09-20 — Campfire Songs
Agent: Investor
Position: No paid conversion has ever been tested; price this as a one-time or seasonal unlock (not a monthly subscription), and prove a stranger will pay before adding another song or feature.
Key claim: Every dollar figure in this analysis is fiction until a real Stripe Payment Link sent to strangers converts — today the app can't even capture a lead (song requests and error reports go through a bare `mailto:` in contact.js, no backend, no email list, no signal).

## [2026-09-20] — Campfire Songs
Agent: Believer
Position: The hard part — hands-free, beat-accurate auto-scroll — is already built and working, which turns this from a feasibility bet into a content-and-distribution bet.
Key claim: The chord/lyric auto-scroll engine (musical-time-driven via playAlongBpm × beats, never estimated scroll speed) and a real-time autocorrelation pitch-detection tuner both went from zero to working across 20 songs in two days per this repo's own git log (2026-09-18 to 2026-09-20) — meaning the single biggest technical risk in the idea is retired, checkable code, not a roadmap promise.

## 2026-09-20 — Campfire Songs
Agent: Judge
Position: FIX FIRST
Key claim: contact.js's CONTACT_EMAIL is still the unset placeholder "REPLACE-WITH-YOUR-EMAIL," so despite two working technical builds (scroll engine, tuner) the project has captured zero real signal from a stranger — fix lead capture and prove one stranger will pay or return before adding another song or feature.

## 2026-09-21 — Campfire Songs
Agent: Judge
Position: The core solo play-along is stranger-ready; multiplayer isn't yet; the real risk is that 30 hours of new features shipped since the last verdict with zero new demand evidence and no instrumentation on the two biggest additions.
Key claim: Since the last Council verdict, 17 substantive commits shipped full Supabase-backed multiplayer, three song-selection modes, and a photo-memories feature — and analytics.js (read in full) fires events for songs, the tuner, and the two contact forms, but has no event for a campfire room being created/joined or a memory being saved, so the two newest, biggest features are also the two nobody can currently tell are being used.

## 2026-09-21 — Campfire Songs
Agent: Judge
Position: Freeze new features and spend the next 7 days getting real strangers onto the existing product, not building more — the Investor's "prove payment before adding features" instruction was skipped for a full round and needs to happen now, not later.
Key claim: Every feature shipped since round 1 (synced multiplayer via Supabase, Memories, Random/Vote/Host-Picks) improves the product without touching the actual open question — zero strangers have used this, zero payment signal exists, and the one true new differentiator (live multiplayer sync) is untested at real low-signal campfire locations, which is the most likely way it embarrasses the team in front of the first strangers who try it.

## [2026-09-21] — Campfire Songs
Agent: Judge
Position: The validated core (tuner + chords + auto-scroll) is good enough for strangers; the unvalidated new core (Groups multiplayer) is not — fix the offline-caching gap and add a privacy notice, then run one real non-friend multiplayer test before building anything else.
Key claim: Every Groups/Supabase commit (MVP, real project connection, Random/Vote/Host-Picks modes) is dated 2026-09-21 per git log — same day as this review — so the flagship new feature has zero recorded human testing beyond today, and sw.js's PRECACHE_URLS still omits groups.js, groups.css, memories.js, and memories.css, meaning the app has no offline fallback for its newest features in exactly the low-signal campsite conditions it's built for.

## 2026-09-21 — Campfire Songs
Agent: Judge
Position: FIX FIRST — the solo core (chords, auto-scroll, tuner) is confirmed stranger-ready and lead capture is now genuinely fixed (real Formspree endpoint), but Groups has no confirmed cross-device test and no privacy disclosure, and zero stranger or payment evidence exists after two full Council rounds asking for exactly that.
Key claim: Every Groups/Supabase commit is dated 2026-09-21 (same-day, per git log) and analytics.js — read in full — still has no event for a room being created/joined, so the newest, riskiest, most differentiated feature in the product is also the one nobody, including the team, can currently see being used or has confirmed works between two separate real devices rather than one dev machine; meanwhile index.html discloses on-device-only storage for the Tuner and Memories but Groups, the one feature that actually talks to a real backend, has no equivalent disclosure at all.
