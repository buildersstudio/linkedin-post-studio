/* ============================================================================
   BUILDERS — the built-in brand, and the file you copy to make the studio yours.

   Everything the studio shows for one brand lives in this single file:
   colors, fonts, the card design, product-illustration widgets, and the
   starter posts in the gallery. The editor engine (studio/studio.mjs) never
   needs to change.

   To create your own brand:
     1. Duplicate this folder (brands/builders → brands/yourname).
     2. Add 'yourname' to brands/registry.mjs (first in the list = default).
     3. Work through this file top to bottom: palette → fonts → logo →
        posts. Every section says what to touch.

   House rule worth keeping: REAL CONTENT ONLY. Never invent metrics, customer
   names, or quotes. Every number and claim in the starter posts below comes
   from the Builders website.
   ============================================================================ */

/* ---- 1. POST SIZES (you can leave these) ----
   LinkedIn renders these three well: square, portrait 4:5 (tallest, most feed
   space), and landscape 1.91:1 (link-preview shape). */
export const FMT = { sq: { w: 1200, h: 1200 }, pt: { w: 1080, h: 1350 }, ls: { w: 1200, h: 627 } };

/* ---- 2. PALETTE ----
   Swap these for your brand colors. Keep the roles: one deep dark, one light
   paper, and a small set of accents used for glows and phase colors. */
export const C = {
  deep: '#05060C',      // the dark card background
  cream: '#FAF7F2',     // the light card background
  ink: '#101015',       // near-black text on light cards
  studio: '#8193FF',    // accent · periwinkle
  network: '#E986B4',   // accent · pink
  capital: '#D4A574',   // accent · gold
  green: '#4AEEB0',     // accent · green
};
export const PHASE_COLORS = ['#8193FF', '#96A0FA', '#A78BFA', '#E986B4', '#4AEEB0'];

/* ---- 3. CARD DESIGN (fonts + type styles) ----
   Every face here is a free Google Font, loaded by the <link> in
   studio/index.html: Stack Sans Headline (display + text), Instrument Serif
   italic (the accent line) and DM Mono (labels). Change a family here and
   change it in that <link> too, or it will silently fall back.
   To use a font file you host yourself instead, drop it in assets/fonts/ and
   add an @font-face rule at the top of the template string below.
   The `--ink/--serifc/--sub/--mono/--lbl` variables flip automatically
   between dark and light cards. */
export const css = (fmt, base) => {
  const { w, h } = FMT[fmt];
  return `
  * { margin:0; padding:0; box-sizing:border-box; }
  .card { position:relative; width:${w}px; height:${h}px; overflow:hidden; background:${C.deep};
          font-family:'Stack Sans Headline',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
          --ink:#fff; --serifc:rgba(255,255,255,0.94); --sub:rgba(255,255,255,0.66);
          --mono:rgba(255,255,255,0.55); --lbl:rgba(255,255,255,0.42); --logo:brightness(0) invert(1); }
  .card.light { background:${C.cream};
          --ink:#101015; --serifc:rgba(16,16,21,0.85); --sub:rgba(16,16,21,0.62);
          --mono:rgba(16,16,21,0.5); --lbl:rgba(16,16,21,0.45); --logo:none; }
  .bglayer, .bglayer > * { position:absolute; inset:0; }
  .bglayer img.bg { width:100%; height:100%; object-fit:cover; }
  .bglayer .scrim { background:linear-gradient(180deg, rgba(5,6,12,0.5) 0%, rgba(5,6,12,0.32) 40%, rgba(5,6,12,0.85) 100%); }
  .bglayer .glow { inset:auto; position:absolute; width:${Math.round(w * 0.95)}px; height:${Math.round(w * 0.95)}px;
          left:50%; top:${h < w ? '-70%' : '-30%'}; transform:translateX(-50%); border-radius:50%; filter:blur(40px); }
  .d { font-family:'Stack Sans Headline',system-ui,sans-serif; font-weight:700; letter-spacing:-0.022em; line-height:1.05; color:var(--ink); }
  .ser { font-family:'Instrument Serif',Georgia,serif; font-style:italic; letter-spacing:-0.01em; line-height:1.04; color:var(--serifc); }
  .mono { font-family:'DM Mono',ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:0.3em; color:var(--mono); }
  .body { font-family:'Stack Sans Headline',system-ui,sans-serif; color:var(--sub); line-height:1.5; }
  .eyebrow { font-family:'DM Mono',ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:0.3em; color:var(--mono); }
  .metric { font-family:'Stack Sans Headline',system-ui,sans-serif; font-weight:700; letter-spacing:-0.022em; line-height:0.95; color:var(--ink); }
  .idx { position:absolute; top:calc(var(--padY)*0.5); right:var(--padX); font-family:'DM Mono',monospace;
         letter-spacing:0.3em; color:var(--lbl); font-size:15px; }
  .brand { position:absolute; left:var(--padX); bottom:calc(var(--padY)*0.55); }
  .brand img { height:24px; filter:var(--logo); }

  /* ---------- product widgets (small in-card product illustrations) ----------
     Ready-made scaffolding for the WIDGETS section below: a cream panel with
     header, rows, tags, bars, chips and columns, in the Builders faces. */
  .w { width:100%; max-width:${Math.round(w * 0.8)}px; background:${C.cream}; border-radius:${Math.round(w * 0.016)}px;
       overflow:hidden; color:${C.ink}; text-align:left; font-size:${Math.round(w * 0.02)}px;
       font-family:'Stack Sans Headline',system-ui,sans-serif;
       box-shadow:0 ${Math.round(w * 0.025)}px ${Math.round(w * 0.058)}px -${Math.round(w * 0.018)}px rgba(0,0,0,0.7); }
  .w-hd { display:flex; align-items:center; justify-content:space-between; gap:1em;
          padding:.85em 1.1em; border-bottom:1px solid rgba(16,16,21,.1); font-family:'Stack Sans Headline',system-ui,sans-serif; font-weight:700; }
  .w-hd .ttl { display:flex; align-items:center; gap:.55em; }
  .w-hd .dot { width:.45em; height:.45em; border-radius:50%; background:${C.studio}; flex:none; }
  .w-row { display:grid; align-items:center; gap:.8em; padding:.72em 1.1em;
           border-bottom:1px solid rgba(16,16,21,.08); }
  .w-row:last-child { border-bottom:none; }
  .w-mono { font-family:'DM Mono',monospace; font-size:.78em; letter-spacing:.08em; color:rgba(16,16,21,.55); }
  .w-tag { font-family:'DM Mono',monospace; font-size:.7em; letter-spacing:.06em; padding:.34em .62em;
           border-radius:.4em; justify-self:start; white-space:nowrap; }
  .w-tag.ok { background:rgba(129,147,255,.16); color:#4d63d8; }
  .w-tag.rev { background:rgba(212,165,116,.2); color:#9a6b2f; }
  .w-tag.rdy { background:rgba(74,238,176,.18); color:#0b7a50; }
  .w-foot { display:flex; align-items:center; justify-content:space-between; gap:1em;
            padding:.8em 1.1em; border-top:1px solid rgba(16,16,21,.1);
            font-size:.82em; color:rgba(16,16,21,.6); }
  .w-pill { display:inline-flex; align-items:center; gap:.45em; background:rgba(129,147,255,.16); color:#4d63d8;
            padding:.4em .75em; border-radius:99em; font-family:'DM Mono',monospace; font-size:.72em; letter-spacing:.06em; }
  .w-bar { height:.5em; border-radius:99em; background:rgba(16,16,21,.1); overflow:hidden; }
  .w-bar > i { display:block; height:100%; background:${C.studio}; border-radius:99em; }
  .w-big { font-family:'Stack Sans Headline',system-ui,sans-serif; font-weight:700; letter-spacing:-.02em; color:${C.ink}; }
  .w-lbl { font-family:'DM Mono',monospace; font-size:.68em; letter-spacing:.14em; text-transform:uppercase;
           color:rgba(16,16,21,.45); }
  .w-split { display:grid; grid-template-columns:1fr 1fr; }
  .w-split > div { padding:1em 1.1em; }
  .w-split > div + div { border-left:1px solid rgba(16,16,21,.1); }
  .w-chip { display:inline-flex; align-items:center; gap:.4em; border:1px solid rgba(16,16,21,.16);
            border-radius:.45em; padding:.32em .6em; font-family:'DM Mono',monospace; font-size:.72em;
            letter-spacing:.04em; color:rgba(16,16,21,.62); }
  .w-cols { display:flex; align-items:flex-end; gap:.55em; height:7.5em; padding:1.1em 1.1em .4em; }
  .w-cols i { flex:1; display:block; background:rgba(129,147,255,.22); border-radius:.3em .3em 0 0; }
  .w-cols i.hi { background:${C.studio}; }
`;
};

/* ---- 4. PRODUCT WIDGETS (empty on purpose) ----
   Widgets are small product illustrations a post can carry (spec field:
   widget:'<key>'): a mock table, a queue, a metric, a chart of YOUR product.
   This brand ships with none; the studio's right panel shows the empty slot.

   The intended way to fill it: ask Claude. Open this folder in Claude Code and
   describe the view you want ("a widget showing our approval queue with three
   rows and a total"). Claude adds an entry here shaped like:

     'my-widget': {
       label: 'Product · what it shows',
       html: () => `<div class="w">
         <div class="w-hd"><span class="ttl"><span class="dot"></span>Title</span><span class="w-mono">meta</span></div>
         <div class="w-row" style="grid-template-columns:1.6fr auto"><span>A row</span><span class="w-tag ok">tag</span></div>
         <div class="w-foot"><span>Footer note</span><span class="w-pill">Highlight</span></div>
       </div>`,
     },

   The .w-* styles in section 3 (header, rows, tags, bars, chips, columns) are
   the ready-made design system for them. Real, plausible content only. */
export const WIDGETS = {};

/* stamp the key on the element so the studio can tell which widget is in a slide */
export const widgetHtml = (key) => {
  const def = WIDGETS[key];
  if (!def) return '';
  return def.html().replace(/<div\b/, `<div data-w="${key}"`);
};

const esc = (t) => String(t ?? '');

/* ---- 5. THE SLIDE RENDERER ----
   Turns one slide spec into card HTML. You rarely need to touch this —
   the spec fields it understands:
     fmt (required) · bg { photo?, glow:'#hex'?, cream:true?, flat:'#hex'?,
     light:true? } · serif/serifPx (the italic line) · kicker/kickerColor
     (mono line) · title/titlePx · body/bodyPx · big/bigPx (giant display
     text) · eyebrow (mono) · widget ('<key>' from WIDGETS) · bottom (mono
     footer line) · idx ('2 / 7') · swipe:true · logo:false ·
     align 'center'(default)|'left' · valign 'center'(default)|'end' */
export function renderSlide(s, base) {
  const { w, h } = FMT[s.fmt];
  const light = !!(s.bg && (s.bg.cream || s.bg.light));
  const padX = Math.round(w * 0.075);
  const padY = Math.round(h * 0.075);
  const isLs = s.fmt === 'ls';
  const gap = Math.round(h * (isLs ? 0.05 : 0.032));
  const align = s.align === 'left' ? 'flex-start' : 'center';
  const tAlign = s.align === 'left' ? 'left' : 'center';

  const bg = s.bg && s.bg.photo
    ? `<img class="bg" src="${base}photos/${s.bg.photo}"><div class="scrim"></div>`
    : s.bg && s.bg.glow
      ? `<div class="glow" style="background:radial-gradient(circle, ${s.bg.glow}30 0%, transparent 65%);"></div>`
      : '';

  const stack = [
    s.serif ? `<span class="ser" data-f="serif" style="font-size:${s.serifPx ?? Math.round(h * 0.05)}px;">${esc(s.serif)}</span>` : '',
    s.kicker ? `<span class="mono" data-f="kicker" style="font-size:${Math.round(w * 0.014)}px; ${s.kickerColor ? `color:${s.kickerColor};` : ''}">${esc(s.kicker)}</span>` : '',
    s.title ? `<h1 class="d" data-f="title" style="font-size:${s.titlePx ?? Math.round(w * 0.06)}px; max-width:${Math.round(w * 0.85)}px;">${esc(s.title)}</h1>` : '',
    s.eyebrow ? `<span class="eyebrow" data-f="eyebrow" style="font-size:${Math.round(w * 0.014)}px;">${esc(s.eyebrow)}</span>` : '',
    s.big ? `<div class="metric" data-f="big" style="font-size:${s.bigPx ?? Math.round(w * 0.185)}px;">${esc(s.big)}</div>` : '',
    s.widget && WIDGETS[s.widget] ? widgetHtml(s.widget) : '',
    s.body ? `<p class="body" data-f="body" style="font-size:${s.bodyPx ?? Math.round(w * 0.026)}px; max-width:${Math.round(w * 0.78)}px;">${esc(s.body)}</p>` : '',
    s.bottom ? `<span class="mono" data-f="bottom" style="font-size:${Math.round(w * 0.0125)}px;">${esc(s.bottom)}</span>` : '',
  ].filter(Boolean).join('\n');

  return `
  <div class="card ${light ? 'light' : ''}" style="--padX:${padX}px; --padY:${padY}px; ${s.bg && s.bg.flat ? `background:${s.bg.flat};` : ''}">
    <div class="bglayer">${bg}</div>
    <div style="position:absolute; inset:${padY}px ${padX}px ${Math.round(padY * (s.logo === false ? 1 : 1.5))}px;
         display:flex; flex-direction:column; align-items:${align}; text-align:${tAlign};
         justify-content:${s.valign === 'end' ? 'flex-end' : 'center'}; gap:${gap}px;">
      ${stack}
    </div>
    ${s.idx ? `<span class="idx">${esc(s.idx)}</span>` : ''}
    ${s.logo === false ? '' : brandHtml(base)}
    ${s.swipe ? `<span class="mono" style="position:absolute; right:${padX}px; bottom:${Math.round(padY * 0.55)}px; font-size:14px; color:var(--mono);">Swipe &rarr;</span>` : ''}
  </div>`;
}

/* the logo in the card's bottom-left corner (white on dark, black on cream) */
const brandHtml = (base) => `<div class="brand"><img src="${base}builders-logo.svg"></div>`;

/* ---- 6. STARTER POSTS ----
   The gallery people see on first open. Each is a tiny spec object; the
   renderer above turns it into a finished card. All copy and numbers below
   are real, from builders.studio. */
const SITE = 'builders.studio';
const P = (id, name, kind, fmt, slide) => ({ id, name, kind, type: 'post', fmt, slides: [{ fmt, ...slide }] });
const pt = (s) => ({ fmt: 'pt', ...s });
const CAR = (id, name, kind, slides) => ({
  id, name, kind, type: 'carousel', fmt: 'pt',
  slides: slides.map((s, i) => pt({ idx: `${i + 1} / ${slides.length}`, ...s })),
});

/* the five phases of a batch, from the landing page */
const PHASES = [
  { d: 'Weeks 0–5', t: 'Validation', b: 'Prove the problem is real. Validation cycles with your ICP, signed design partners, and a build week that ends in a go or no-go.' },
  { d: 'Weeks 5–10', t: 'Shape', b: 'Sharpen the product with your design partners and run at outside investors. The ventures that prove it, we incorporate together.' },
  { d: 'Months 3–4', t: 'Launch', b: 'Bring the product to market together: first customers, first revenue, a real go-to-market.' },
  { d: 'Months 4–6', t: 'Growth', b: 'Scale what works together: follow-on capital, key hires, and new markets.' },
  { d: 'Month 6+', t: 'Graduation', b: 'Not a phase, a moment: the team and momentum in place, building without us.' },
];

export const ASSETS = [
  P(1, 'next-venture', 'Dark glow · next venture', 'sq',
    { bg: { glow: C.studio }, serif: 'Builders', title: 'Your next venture starts here.', titlePx: 74, bottom: SITE }),
  P(2, 'on-ai-cream', 'Cream · AI ventures, on AI', 'sq',
    { bg: { cream: true }, title: 'We build AI ventures, on AI.', titlePx: 70,
      body: 'The product is AI-native. The studio that builds it runs on AI too, from discovery to go-to-market.', bottom: SITE }),
  P(3, 'fullstack', 'Green glow · full-stack AI', 'sq',
    { bg: { glow: C.green }, title: 'Full-stack AI ventures.', titlePx: 78,
      body: 'AI-native in what we build and in how we build it. Software that predicts and decides at its core, made by a studio that itself runs on AI.', bottom: SITE }),
  P(4, 'ten-weeks', 'Photo · ten weeks', 'pt',
    { bg: { photo: 'whiteboard-pitch.webp' }, align: 'left', valign: 'end',
      title: 'From idea to venture, in ten weeks.', titlePx: 62,
      body: 'From a raw idea to an incorporated, funded company, with decision gates that have teeth.' }),
  P(5, 'studio-behind', 'Photo · the studio behind you', 'pt',
    { bg: { photo: 'meeting-room-glass.webp' }, align: 'left', valign: 'end',
      title: 'The whole studio behind you.', titlePx: 62,
      body: 'Go-to-market, product, legal, finance, operations and recruitment, in the room every week.' }),
  P(6, 'capital', 'Gold glow · staged capital', 'sq',
    { bg: { glow: C.capital }, eyebrow: 'Staged capital', big: '€500K', bigPx: 190,
      body: '€150K at incorporation via a SAFE note, up to €350K more at seed. Capital that follows the evidence, not the pitch.', bodyPx: 27, bottom: SITE }),
  P(7, 'europe', 'Cream · built in Europe', 'sq',
    { bg: { cream: true }, big: 'Built in Europe', bigPx: 100,
      eyebrow: 'GDPR-compliant by design · Rotterdam home base', bottom: SITE }),
  P(8, 'rotterdam', 'Photo · Rotterdam', 'pt',
    { bg: { photo: 'rotterdam-dusk.webp' }, align: 'left', valign: 'end',
      title: 'Rotterdam is home base.', titlePx: 64, bottom: SITE }),
  P(9, 'network', 'Photo · the network', 'sq',
    { bg: { photo: 'investor-house-talk.webp' }, align: 'left', valign: 'end',
      title: 'A network that actually shows up.', titlePx: 58,
      body: 'Investors, CTOs and operators who answer the phone because they already work with us.' }),
  P(10, 'banner-cream', 'Banner · cream', 'ls',
    { bg: { cream: true }, serif: 'Builders', title: 'Your next venture starts here.', titlePx: 50, bottom: SITE }),

  CAR(41, 'car-phases', 'Carousel · how a batch works', [
    { bg: { glow: C.studio }, serif: 'Builders', title: 'Six months, from validation to graduation.', titlePx: 60,
      body: 'The five phases of a batch, with a decision gate between each.', swipe: true },
    ...PHASES.map((p, i) => ({
      kicker: p.d, kickerColor: PHASE_COLORS[i], title: `${p.t}.`, titlePx: 76, body: p.b,
    })),
    { bg: { cream: true }, serif: 'Builders', title: 'Your next venture starts here.', titlePx: 56, bottom: SITE },
  ]),
];

/* ---- 7. THE CONFIG the studio engine reads ----
   Field guide:
     key/name        internal key + display name (the page title becomes
                     "<name> LinkedIn Posts")
     base            where this brand's asset files live, relative to studio/
     brandHtml       the in-card logo (used by the Logo layer toggle)
     fmts            the sizes offered in the editor's size dropdown
     flats           background swatches: [label, glowColor|'', cssColor, isLight]
     darkFlat        the dark color behind photos and PDF pages
     photoRoot       subfolder of assets/ that holds the photos
     photoGroups     the photo picker, grouped: { 'group label': ['file', …] }
     widgets         the product illustrations (section 4)
     assets          the starter posts (section 6) */
export const CONFIG = {
  key: 'builders',
  name: 'Builders',
  base: '../brands/builders/assets/',
  brandHtml,
  fmts: [['sq', 'Square 1200'], ['pt', 'Portrait 4:5'], ['ls', 'Landscape 1.91:1']],
  flats: [
    ['Dark', '', '#05060C', false],
    ['Studio', '#8193FF', '#05060C', false],
    ['Green', '#4AEEB0', '#05060C', false],
    ['Pink', '#E986B4', '#05060C', false],
    ['Cream', '', '#FAF7F2', true],
  ],
  gradient: false,
  blurBg: false,
  darkFlat: '#05060C',
  photoRoot: 'photos/',
  photoGroups: {
    'scenes': ['whiteboard-pitch.webp', 'whiteboard-two.webp', 'meeting-room-glass.webp', 'kitchen-counter-build.webp', 'one-on-one.webp', 'investor-house-talk.webp', 'bar-founder.webp', 'rotterdam-bridge.webp', 'rotterdam-dusk.webp', 'europe-flag.webp'],
    'events': ['events/cto-social.webp', 'events/demo-night.webp', 'events/fireside.webp', 'events/founder-weekend.webp', 'events/investor-house.webp', 'events/winter-social.webp'],
  },
  videos: [],
  FMT, css, renderSlide,
  widgets: WIDGETS,
  widgetHtml,
  newPostHint: 'dark glows, cream cards, photo scenes; product illustrations arrive once Claude generates them (see WIDGETS above)',
  assets: ASSETS,
};
