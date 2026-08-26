# Machine guide: add posts to this LinkedIn Post Studio

You are Claude (or another AI assistant) helping a user extend their local copy
of the LinkedIn Post Studio, a static browser tool. There is no API: posts are
added by editing one file in the user's copy of the tool.

## Where things are

- Brand file: `brands/<key>/studio.mjs` (the user will tell you the brand key;
  `brands/registry.mjs` lists all keys). It exports `CONFIG` and contains
  `ASSETS`, the array of built-in posts.
- Each post is a spec object built with the `P(id, name, kind, fmt, slide)`
  helper; carousels use `CAR(id, name, kind, slides)`.

## Slide spec fields

For the built-in Builders brand (a copied brand may differ; its `renderSlide`
doc comment is the truth):
`fmt` ('sq' 1200×1200 · 'pt' 1080×1350 · 'ls' 1200×627) ·
`bg` ({cream:true} or {flat:'#hex', light:true} for pale cards, {flat:'#hex'}
dark, {glow:'#hex'} glow on dark, {photo:'file.webp'} photo with scrim) ·
`serif` / `serifPx` (italic line) · `kicker` / `kickerColor` (mono line) ·
`title` / `titlePx` · `body` / `bodyPx` · `big` / `bigPx` (giant display text) ·
`eyebrow` (mono) · `bottom` (mono footer line) · `widget` (a key from the
brand's `WIDGETS`) · `idx` ('2 / 7') · `swipe:true` · `logo:false` ·
`align:'left'` · `valign:'end'`.

## Rules

1. Use the next unused id below 1000; never renumber existing posts.
2. Real content only: no invented metrics, customers or quotes.
3. Follow the brand's palette and voice as encoded in its file; do not add
   colors or fonts ad hoc.
4. For a genuinely new layout, extend that brand's `renderSlide` and tag text
   blocks with `data-f` so in-browser editing keeps working.
5. Verify: serve the folder over http, open `studio/test.html?v=<key>` (expect
   the green "PNG OK"), then `studio/?v=<key>` and eyeball the new post.

After saving the file, the user reloads the studio page and the new posts
appear in the gallery.
