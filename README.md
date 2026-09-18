# Campfire Songs

Songs for when the fire's low and nobody wants to go home.

A single-page, cinematic playlist experience for a hand-picked set of campfire songs — late-night road-trip staples and acoustic singalongs, presented with a warm firelight aesthetic instead of a typical music-app UI.

## What's here

- **Hero** — a full-height, cinematic intro with an animated campfire glow, drifting embers, and a soft star field.
- **Featured tonight** — one song called out in detail, with a generated "album sleeve," a short reason it made the list, and a Spotify link.
- **Around the Fire** — the main playlist, filterable by mood (*Late Nights*, *Acoustic*, *Singalongs*, *Nostalgia*), each row showing the artist, year, capo/chords for guitar, and a link to a full chord chart.
- **When the Fire's Dying** — a smaller, quieter set for the end of the night.
- **Shuffle the fire** — jumps to a random song in the list.
- **Progress** — mark songs as "heard around the fire"; progress is saved locally in your browser (`localStorage`), nothing is sent anywhere.
- **Fire sound** — an optional, subtle campfire crackle, synthesised entirely in the browser with the Web Audio API (no audio file to download).
- **Closing** — "The fire's nearly out," with one last song.

## Stack

Plain HTML, CSS, and JavaScript — no build step, no framework, no dependencies. Open `index.html` directly, or serve the folder with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Files

- `index.html` — page structure and content shell
- `style.css` — all styling (fonts, campfire effects, layout, responsive rules)
- `script.js` — song data and all interactivity (rendering, filters, shuffle, progress, sound, scroll reveals)

Album art is generated on the fly (a warm gradient plus the song's initial) rather than fetched from anywhere, so the page has no network dependencies beyond Google Fonts.
