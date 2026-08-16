# Project Store

A portfolio laid out like the Steam store. `index.html` is the storefront —
featured carousel, category tabs, search, and a row per project. Click any row
and you land on `app.html?id=<slug>`, a Steam app-page: media gallery, sidebar
with release date and tags, a green "buy" button that takes you to the live
site, then About / Features / Built With.

Static HTML, CSS and JS. No build step, no dependencies.

## Run it

Open `index.html`. That's it — though a local server is nicer if you're adding
video, since some browsers are fussy about `file://` media:

```
python -m http.server 8000
```

## Adding a demo video or screenshots

Every project has a folder at `assets/media/<slug>/`. Drop files in, then list
them in that project's `media` array in `js/data.js`:

```js
media: [
  { type: "video", src: "assets/media/voice-notes/demo.mp4",
    poster: "assets/media/voice-notes/poster.jpg" },
  { type: "image", src: "assets/media/voice-notes/01.png" },
  { type: "image", src: "assets/media/voice-notes/02.png" },
],
```

The first entry is what shows in the big player; the rest become the thumbnail
strip underneath. An empty `media: []` shows a styled "demo footage coming
soon" placeholder, and a broken path falls back to the same placeholder rather
than a broken-image icon.

**Recording tips:** 1920×1080, 30fps, MP4 (H.264 + AAC). Keep clips under about
60 seconds and 10 MB — GitHub Pages serves them fine at that size, and nobody
watches longer.

## Adding a project

Append an object to `PROJECTS` in `js/data.js`. The list renders newest-first by
`released`, so the date is the only ordering control. Fields:

| Field | What it does |
|---|---|
| `slug` | URL id and media folder name |
| `icon`, `accent`, `accent2` | Procedural capsule art — a gradient plus the emoji, standing in for real key art |
| `tagline` | One line, shown on the row, the card and the sidebar |
| `genres` | Must be values from `GENRES` — drives the category tabs |
| `tags` | Free-form, shown as Steam-style tag chips |
| `status` | `"Shipped"` or `"In Development"` — colours the pill |
| `link` / `linkLabel` | The green button. `null` renders a grey "not published yet" state |
| `repo` | Optional secondary Source button |
| `about` | Array of paragraphs |
| `highlights` | Array of bullets, shown above the paragraphs |
| `features` | Steam's feature chips |
| `tech` | Object → the "Built With" table |

Featured-carousel picks are the slug list at the top of `js/store.js`.

## Files

```
index.html        storefront
app.html          detail page shell — all content comes from data.js
css/steam.css     the whole theme
js/data.js        every project, descriptions and links
js/ui.js          capsule art, formatting, shared helpers
js/store.js       carousel, tabs, search, rows
js/app.js         detail page rendering
assets/media/     per-project video and screenshots
```
