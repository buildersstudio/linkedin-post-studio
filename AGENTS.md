# LinkedIn Post Studio — operating manual for Claude

You are working inside a small, dependency-free, static web tool that lets
non-technical people make on-brand LinkedIn posts in the browser. There is no
build step, no server code and no database. Your job here is usually one of:
set up a new brand, add posts to an existing brand, design a new layout or
widget, or fix something a user describes in plain words.

## Architecture (30 seconds)

- `studio/index.html` + `studio/studio.mjs` — the shared editor engine
  (gallery, click-to-edit, backgrounds, exports). Brand-agnostic. Only touch it
  for engine bugs or new engine features, never for brand work.
- `brands/<key>/studio.mjs` — ONE file per brand exporting `CONFIG`: palette,
  card CSS, widgets, a `renderSlide(spec)` function, and `ASSETS` (the starter
  posts). This is where almost all work happens.
- `brands/<key>/assets/` — that brand's images (logos, backgrounds). Files here
  ship with the repo: never add images the user does not own.
- `brands/registry.mjs` — the list of brand keys the studio will load; the
  FIRST key is the brand the tool opens with by default.
- `index.html` — a plain redirect to `studio/` (the old marketing landing page
  is parked in `archive/landing.html`, currently unused).
- The floating dock in `studio/index.html` links to the tool's GitHub repo and
  toolkit.builders.studio; if the repo moves, update those hrefs there.
- User edits live in localStorage per browser (`poststudio:<key>`); there is no
  cloud state. Built-in posts changed underneath a user's edit are handled by
  the engine (baseSig reconciliation), so editing ASSETS is always safe.

## Adding posts to a brand

Append spec objects to `ASSETS` in `brands/<key>/studio.mjs`, using the `P`
(single post) and `CAR` (carousel) helpers already in the file. Rules:

- Give each post the next unused id below 1000; never reuse or renumber ids.
- Spec fields the renderer understands are documented above `renderSlide` in
  the brand file. For the built-in Builders brand: `fmt, bg {photo|glow|cream|
  flat|light}, serif, serifPx, kicker, kickerColor, title, titlePx, body,
  bodyPx, big, bigPx, eyebrow, bottom, widget, idx, swipe, logo, align,
  valign`. A copied brand may rename or extend these; the brand file is the
  truth.
- Vary the approach across a batch (typographic, metric, photo, dark statement,
  product widget, quote, carousel) unless told otherwise.
- REAL CONTENT ONLY: never invent metrics, customers, quotes or launch claims
  for a real brand. Ask for real numbers, or design without numbers.

## Setting up a new brand

1. Copy `brands/builders` to `brands/<key>` (lowercase key).
2. Add the key to `brands/registry.mjs`.
3. Research the brand (website, brand book, whatever the user gives you) and
   work through the numbered sections of the new `studio.mjs`: palette, fonts
   (update the Google Fonts link in `studio/index.html` if the family changes),
   logo lockup, background swatches (`flats`), `photoGroups`, widgets that mock
   the user's actual product, then rewrite `ASSETS` with the brand's actual
   messages.
4. Put the new key FIRST in `brands/registry.mjs` when it should be the brand
   the tool opens with.
5. Vendor real logo files into `brands/<key>/assets/logos/`; ask the user for
   them if you cannot obtain originals. Never trace or redraw a logo.

## New layouts and widgets

Brands ship with `WIDGETS` empty on purpose: the editor's "Product
illustration" panel shows an empty slot telling users to ask you for them.
Generating widgets on request is expected, core work here.

- A new widget = a new entry in `WIDGETS` (label + `html()` returning one
  root element). Style it with the shared `.w-*` classes or inline styles;
  it must render correctly at card width in all three formats since sizes are
  driven by `em` off the card-width-based font-size.
- A new layout field = extend the brand's `renderSlide` (and only that brand's).
  Tag every text block with `data-f="<field>"` so click-to-edit and the size
  switch keep working, and keep the `.bglayer` / content-stack / `.brand`
  structure the engine relies on.

## Verify before you hand back

1. Serve the folder (`python3 -m http.server --bind 127.0.0.1 8911`, or run
   `./start-mac.command` which picks and remembers a high port) — module imports fail from
   `file://`.
2. Open `studio/test.html?v=<key>`: green "PNG OK" means render + export work.
3. Open `studio/?v=<key>`: check the gallery, open your new post, switch all
   three sizes, and download a PNG.

## House style for anything user-facing

Plain language, no jargon, no exclamation marks. The reader may have never used
a terminal; when instructions are unavoidable, they are double-click level.
