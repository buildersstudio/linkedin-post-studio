# Make the studio your brand

This is the full walkthrough. It assumes nothing technical beyond being able to
copy a folder and edit a text file. Every change is visible immediately: save the
file, reload the studio page in your browser.

If you use Claude Code, you can skip all of this and ask Claude instead; see
"The fast lane" in the [README](README.md).

## 0. What a "brand" is here

One folder under `brands/` holds everything the studio shows for one brand:

```
brands/
  yourname/
    studio.mjs        ← one file: colors, fonts, logo, widgets, starter posts
    assets/
      your-logo.svg   ← the in-card logo
      photos/         ← photos or artwork used as post backgrounds
```

The editor itself (the `studio/` folder) is shared by every brand and never
needs changing.

## 1. Copy the built-in brand

Duplicate `brands/builders` and rename the copy. Lowercase, no spaces:
`acmecorp`, not `Acme Corp`. Then add that name to the list in
`brands/registry.mjs`:

```js
export const BRANDS = ['builders', 'acmecorp'];
```

You can already open it: `studio/?v=acmecorp` (it still looks like Builders).

## 2. Drop in your assets

- **Logo**: one SVG in `assets/` (the card flips it white on dark backgrounds
  automatically via a CSS filter, so a single dark version is enough). PNG works
  too.
- **Photos / artwork**: put your background images in `assets/photos/` (or any
  folders you like inside `assets/`). Use generous sizes, at least 1080px on
  the short side, since exports are rendered at 2×.
- **Fonts**: the built-in brand uses free Google Fonts, listed in the `<link>`
  in `studio/index.html`. To use a font you host yourself, put the file in
  `assets/fonts/` and add an `@font-face` rule in section 3 of `studio.mjs`.
  Check your licence before committing a paid font to a public repo.

Only use images you own the rights to. They ship with the folder, so if you
publish the repo or host it on GitHub Pages, they are public.

## 3. Work through studio.mjs

Open `brands/yourname/studio.mjs` in any text editor. The file is organized as
seven numbered sections, each with instructions at the top:

1. **Post sizes**: leave as is (square, portrait 4:5, landscape).
2. **Palette**: replace the hex colors with yours. Keep the roles as described
   (one accent family, inks for text, one deep dark).
3. **Card design**: the fonts and type styles. The families named here must
   match what is loaded in the `<link>` in `studio/index.html` (Google Fonts)
   or by an `@font-face` rule you add here, otherwise the browser silently
   falls back to a system font.
4. **Product widgets**: small mock views of your product that can sit inside a
   post (a table, a metric, a chart, a list of integrations). This section
   starts empty; the easiest way to fill it is to ask Claude, as the comment in
   the file explains. The `.w-*` styles in section 3 are their design system.
5. **The slide renderer**: leave as is unless you want new layout fields.
6. **Starter posts**: the gallery. Each post is a small spec like

   ```js
   P(6, 'capital', 'Gold glow · staged capital', 'sq',
     { bg: { glow: C.capital }, eyebrow: 'Staged capital', big: '€500K',
       body: 'Capital that follows the evidence, not the pitch.', bottom: SITE }),
   ```

   Change the words, backgrounds and sizes. Keep the ids unique. Real content
   only: your real numbers, your real quotes, or none.
7. **CONFIG**: the brand name, the in-card logo, the background swatches
   (`flats`), and which image files appear in the photo picker (`photoGroups`).

Reload the studio after each save to see the result.

## 4. Make it the default

The studio opens whichever brand the address names (`studio/?v=yourname`), and
the root page forwards to the first brand in `brands/registry.mjs`. Put your
brand first in that list and the tool opens straight into it. You can delete
the `brands/builders` folder once you no longer need the reference (remove
`builders` from the registry too).

## 5. Check it

- Open `studio/test.html?v=yourname`. A green "PNG OK" box means your brand
  module, its assets and the export pipeline all work.
- In the studio, open a post and download a PNG. Check the logo is sharp and
  the text sits inside the card on all three sizes.

## Common wishes

- **"I want a photo of ours as a background swatch."** Add the file under
  `assets/`, then list it in `photoGroups` in CONFIG. Groups are just labels;
  make as many as you like.
- **"I want another text style."** Add a CSS class in section 3, then use it in
  the renderer (section 5) behind a new spec field, or simply put the styling
  inline in a widget.
- **"I want a new layout the spec cannot express."** That is a job for Claude
  (or any developer): the renderer is one function that turns a spec into HTML.
  See [AGENTS.md](AGENTS.md).
- **"Two brands, one studio."** Just repeat these steps; the registry accepts
  any number of brands, and each gets its own card, gallery and saved edits.
