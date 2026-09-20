# Brag Plan — Campfire Songs

> Produced by `/brag` Steps 1–2 only. Step 3 (Hyperframes composition/render)
> could not run in this session — see **Blocked at Step 3** at the bottom.

## Invocation

- Flags given: none (`/brag` bare)
- `--voice`: absent → narration stays off
- Tone: not specified → inferred `default` (see reasoning below)
- Format: `landscape` (default)
- Duration target: 20s (within the 15–25s window)
- Music: on · SFX: on (defaults)
- Title: inferred — "Campfire Songs"

## Project inspection

1. **What is it?** A 20-song campfire/road-trip playlist website — dark navy
   night sky, warm amber "torn-paper zine" aesthetic. Vanilla HTML/CSS/JS, no
   framework, no build step.
2. **Who's it for?** Whoever's still up when the fire's low — the site's own
   line is "Songs for when the fire's low and nobody wants to go home."
3. **What's the single most impressive/surprising thing it does?** The
   play-along chord viewer runs on a real musical clock (reference tempo vs.
   play-along tempo, 3/4 and 4/4 time, per-section beat timing, a spoken
   count-in), not a scroll-position guess.
4. **Second-most impressive thing?** A from-scratch chromatic guitar tuner —
   live Web Audio API pitch detection, entirely on-device, zero network
   calls.
5. **What does it actually look like (real UI, not description)?** The dark
   hero with the italic "Campfire Songs" title; the paper-colored chord sheet
   modal with one glowing active chord; the tuner's FLAT/IN TUNE/SHARP needle
   meter; the footer's plain-spoken Request a Song / Report a Bug row.
6. **Any real copy worth quoting on screen?** Yes — "Songs for when the
   fire's low and nobody wants to go home," "Campfire Songs — a playlist,
   not a product," the count-in "4…3…2…1," and the contact form's honest
   fineprint ("This form isn't connected to an email address yet").
7. **What's the funny/absurd angle, if any?** Not a joke project — the charm
   is sincerity and craft (a hobby site with genuinely over-engineered
   correctness: real BPM math, real pitch detection, real mobile testing).
   That argues against `chaotic`/`yc-parody` and for `default`.
8. **Does it need sound?** Yes — it's a music site; a quiet ember-crackle
   bed plus the actual count-in beat is free, specific texture no generic
   template would have.
9. **What's the one thing it does NOT do that shouldn't be implied?** No
   backend, no accounts, no streaming playback of real audio — it's chords
   and timing, not a music player. The video shouldn't suggest otherwise.

**Creative angle:** warm, sincere, a little proud of its own craftsmanship —
sell the *care* (real clock, real pitch detection, real mobile testing,
honest forms), not hype language.

## Storyboard (tone: default · landscape · ~20s)

| # | Beat | Time | Visual | On-screen text | Audio/SFX |
|---|------|------|--------|-----------------|-----------|
| 1 | Hook | 0:00–0:02.5 | Dark navy hero, ember glow drifting behind the italic "Campfire Songs" title | "Songs for when the fire's low." | Soft ember crackle, music fades in low |
| 2 | Reveal | 0:02.5–0:05.5 | Cut to the tracklist, a card opening into the chord-sheet modal for a real song | "20 songs. Real chords. No app to download." | Music picks up |
| 3 | Highlight — playback engine | 0:05.5–0:09.5 | Chord sheet mid-play: count-in overlay "4…3…2…1," then exactly one chord glowing as it advances | "A real beat clock — not a scrollbar pretending to be one." | Count-in beats audible, then a soft metronome tick synced to the chord changes |
| 4 | Highlight — tuner | 0:09.5–0:13.5 | Cut to the tuner page: needle sweeps in from FLAT, settles center, card gets its amber "in tune" glow | "A tuner that actually listens. Nothing leaves your phone." | Tuner's status change gets a light chime |
| 5 | Highlight — honesty/mobile | 0:13.5–0:17 | Quick 3-cut: the same chord sheet reflowing at phone width, then the Report-a-Bug form's fineprint line | "Fits in your pocket. Honest when it can't do something yet." | Quick cut-timed whooshes |
| 6 | Punchline / outro | 0:17–0:20 | Back to the dark hero, embers drifting past the logo, then the site's own footer line | "Campfire Songs — a playlist, not a product." | Music resolves, crackle fades out |

Total: 20.0s — within the 15–25s window.

**Music cue guidance:** no bundled track available to read cues from in this
session (see blocker below) — cuts above are planned to land on beat 1/3 of
a 4-count bar if a track with audible beats is selected at composition time.

## Blocked at Step 3

`/brag`'s Step 3 hands this plan to Hyperframes for the actual composition
and render. That requires:

- `references/step-3-compose.md` and `references/audio.md` (this skill's own
  composition instructions)
- The `hyperframes-core` / `hyperframes-animation` / `hyperframes-creative` /
  `hyperframes-keyframes` / `hyperframes-cli` domain skills

None of these are present in this session — the installed copy of this skill
is `SKILL.md` only, with no `references/`, `assets/`, or `scripts/`, and the
Hyperframes domain skills aren't available here either. That looks like a
gap in how this skill's plugin (`plugin_014tm9VZtCxmpgien6Gp1r8D`) delivered
its files, not something this session can self-repair.

This plan is ready to hand off once that's resolved — it doesn't need to be
redone, just composed and rendered.
