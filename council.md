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

## 2026-09-21 — Campfire Songs
Agent: Judge
Position: Freeze new features and spend the next 7 days getting real strangers onto the existing product, not building more — the Investor's "prove payment before adding features" instruction was skipped for a full round and needs to happen now, not later.
Key claim: Every feature shipped since round 1 (synced multiplayer via Supabase, Memories, Random/Vote/Host-Picks) improves the product without touching the actual open question — zero strangers have used this, zero payment signal exists, and the one true new differentiator (live multiplayer sync) is untested at real low-signal campfire locations, which is the most likely way it embarrasses the team in front of the first strangers who try it.
