/* Post Studio — the shared, brand-aware editor engine (one tool for every brand).
   You should not need to touch this file: everything brand-specific (logo, colors,
   photos, templates, starter posts) lives in ../brands/<key>/studio.mjs.

   Gallery: masonry of live previews; hover a card for its number, ↓ PNG, ♥ favourite,
   ⧉ duplicate, ✕ remove. Editor: click any text to rewrite it · right panel = background
   swatches/photos + layer toggles · carousel rail with drag-and-drop reorder · exports:
   PNG 2×, carousel PDF, 6s ken-burns WebM video.

   Everything you change is saved automatically in this browser (localStorage) — there is
   no server and no account. Clearing the browser's site data clears your edits. */

const { BRANDS } = await import('../brands/registry.mjs');
const { scopeCss, assetSlug, pickBrand } = await import('./pure.mjs');
const vkey = pickBrand(location.search, BRANDS);

const { CONFIG } = await import(`../brands/${vkey}/studio.mjs`);
const BASE = CONFIG.base;
const FMT = CONFIG.FMT;

/* The top-left of the bar is the TOOL's identity (set in index.html);
   the brand's own name leads the page header below it. */
document.title = `${CONFIG.name} LinkedIn Posts`;

/* ---------- persistence (per brand, per browser) ---------- */
const SKEY = `poststudio:${vkey}`;
const store = Object.assign({ favs: {}, hidden: {}, copies: [] }, JSON.parse(localStorage.getItem(SKEY) || '{}'));
let favsOnly = false;   // top-of-page filter: show every post, or only the loved ones

const stamp = (a) => { a.updatedAt = Date.now(); return a; };

/* THE RULE: your edit never blocks an update, and an update never destroys
   your edit. Each override remembers the template version it was based on
   (baseSig). When the brand's built-in post changes underneath it, the
   override turns into a standalone duplicate ("· edited") and the updated
   original reappears next to it — both visible, nothing lost, nothing masked. */
const specSig = (a) => {
  const s = JSON.stringify(a);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
};
function reconcileOverrides() {
  let changed = false;
  for (const c of [...store.copies]) {
    const builtin = CONFIG.assets.find(a => a.id === c.id);
    if (!builtin || !store.hidden[c.id]) continue;   // only same-id overrides of hidden built-ins
    const sig = specSig(builtin);
    if (c.baseSig === undefined) {                   // pre-rule override: adopt the current version as its base
      c.baseSig = sig;
      changed = true;
      continue;
    }
    if (c.baseSig !== sig) {
      const oldId = c.id;
      c.id = nextCopyId();
      c.kind = (c.kind || '').replace(/ · edited$/, '') + ' · edited';
      c.baseSig = null;
      stamp(c);
      if (store.favs[oldId]) { store.favs[c.id] = 1; delete store.favs[oldId]; }
      delete store.hidden[oldId];
      changed = true;
    }
  }
  if (changed) save();
}

const save = () => localStorage.setItem(SKEY, JSON.stringify(store));
const clone = (o) => JSON.parse(JSON.stringify(o));

function allAssets() {
  /* Anything you touched leads the gallery, most recent first; the untouched
     built-ins follow in their designed order. */
  const touched = [...store.copies].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  // built-ins: newest additions first (new brand posts get the next highest id)
  const builtins = CONFIG.assets.filter(a => !store.hidden[a.id]).slice().sort((a, b) => b.id - a.id);
  return [...touched, ...builtins];
}
function findAsset(id) { return allAssets().find(a => a.id === id); }
function nextCopyId() { return Math.max(1000, ...store.copies.map(c => c.id)) + 1; }
const slug = (a) => assetSlug(vkey, a);
function dlUrl(url, name) { const el = document.createElement('a'); el.href = url; el.download = name; el.click(); }

/* ---------- scoped css ---------- */
const injected = new Set();
function ensurePreviewCss(fmt) {
  if (injected.has(fmt)) return;
  injected.add(fmt);
  const st = document.createElement('style');
  st.textContent = scopeCss(CONFIG.css(fmt, BASE), `.pv-${fmt}`);
  document.head.appendChild(st);
}

/* ---------- page header: one brand, one page ---------- */
function buildHeader() {
  const assets = allAssets();
  const favs = assets.filter(a => store.favs[a.id]).length;
  const vids = (CONFIG.videos || []).length;
  document.getElementById('htitle').textContent = `${CONFIG.name} LinkedIn Posts`;
  document.getElementById('hsub').textContent =
    `${assets.length} posts${vids ? ` + ${vids} videos` : ''}${favs ? ` · ${favs} favourite${favs > 1 ? 's' : ''}` : ''} · click any to edit`;
  // the compact title in the sticky bar mirrors the big one
  document.getElementById('ctitle').textContent = `${CONFIG.name} LinkedIn Posts`;
  document.getElementById('ccount').textContent =
    favsOnly ? `${assets.filter(a => store.favs[a.id]).length} favourites` : `${assets.length} posts`;
  const ff = document.getElementById('favfilter');
  ff.classList.toggle('on', favsOnly);
  ff.title = favsOnly ? `Showing ${favs} favourite${favs === 1 ? '' : 's'} · click for all posts` : 'Show favourites only';
}

/* ---------- gallery (masonry) ---------- */
const grid = document.getElementById('grid');
const lb = document.getElementById('lb'), lbc = document.getElementById('lbc');
window.lb = lb;

function fitPreviews() {
  document.querySelectorAll('#grid .pv').forEach(pv => {
    const { w } = FMT[pv.dataset.fmt];
    const s = pv.clientWidth / w;
    const card = pv.firstElementChild;
    if (card && s > 0) card.style.transform = `scale(${s})`;
  });
}
window.addEventListener('resize', fitPreviews);
window.addEventListener('load', fitPreviews);

const DL_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>';
const DUP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const BIN_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14"/></svg>';

async function quickPng(a) {
  const s0 = a.slides[0];
  const { w, h } = FMT[s0.fmt];
  ensurePreviewCss(s0.fmt);
  const host = document.createElement('div');
  host.className = `pv-${s0.fmt}`;
  host.style.cssText = 'position:fixed;left:-99999px;top:0;';
  host.innerHTML = a.savedHtml?.[0] ?? CONFIG.renderSlide(s0, BASE);
  document.body.appendChild(host);
  try {
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 160));
    const url = await htmlToImage.toPng(host.firstElementChild, { width: w, height: h, pixelRatio: 2 });
    dlUrl(url, `${slug(a)}.png`);
  } catch (e) { alert('PNG failed: ' + e); }
  finally { host.remove(); }
}

function buildGrid() {
  grid.innerHTML = '';
  const items = allAssets().filter(a => !favsOnly || store.favs[a.id]);
  items.forEach(a => {
    const s0 = a.slides[0];
    const { w, h } = FMT[s0.fmt];
    ensurePreviewCss(s0.fmt);
    const el = document.createElement('div');
    el.className = 'g-card' + (store.favs[a.id] ? ' faved' : '');
    el.innerHTML = `
      <div class="shot">
        <div class="pv pv-${s0.fmt}" data-fmt="${s0.fmt}" style="aspect-ratio:${w}/${h}"></div>
        <button class="fav" data-op="fav" title="Favourite">♥</button>
        <span class="num">#${a.id}</span>
        ${a.type === 'carousel' ? `<span class="badge">${a.slides.length} slides</span>` : ''}
        <div class="act">
          <button data-op="png" title="Download PNG">${DL_SVG}</button>
          <button data-op="dup" title="Duplicate">${DUP_SVG}</button>
          <button data-op="del" title="Remove">${BIN_SVG}</button>
        </div>
      </div>`;
    const pv = el.querySelector('.pv');
    pv.innerHTML = a.savedHtml?.[0] ?? CONFIG.renderSlide(s0, BASE);
    el.addEventListener('click', (e) => {
      const op = e.target.closest('[data-op]')?.dataset.op;
      if (op === 'png') { quickPng(a); return; }
      if (op === 'fav') {
        store.favs[a.id] ? delete store.favs[a.id] : store.favs[a.id] = 1;
        save();
        el.classList.toggle('faved', !!store.favs[a.id]);
        if (favsOnly && !store.favs[a.id]) el.remove();   // unloved while filtering: it leaves
        buildHeader();
        return;
      }
      if (op === 'dup') {
        const c = clone(a); c.id = nextCopyId(); c.kind = a.kind.replace(/ · copy.*$/, '') + ' · copy';
        stamp(c); store.copies.push(c); save(); buildGrid(); return;
      }
      if (op === 'del') {
        if (!confirm(`Remove #${a.id} from the grid?`)) return;
        if (a.id >= 1000) { store.copies = store.copies.filter(c => c.id !== a.id); }
        else { store.hidden[a.id] = 1; }
        delete store.favs[a.id]; save();
        buildGrid(); return;
      }
      openEditor(a.id);
    });
    grid.appendChild(el);
  });
  (favsOnly ? [] : (CONFIG.videos || [])).forEach(v => {
    const { w, h } = FMT[v.fmt];
    const el = document.createElement('div');
    el.className = 'g-card';
    el.innerHTML = `
      <div class="shot">
        <video src="${BASE}${v.file}" autoplay muted loop playsinline style="aspect-ratio:${w}/${h}"></video>
        <span class="badge">video</span>
        <span class="num">#${v.id}</span>
        <div class="act"><a href="${BASE}${v.file}" download onclick="event.stopPropagation()">${DL_SVG} WEBM</a></div>
      </div>`;
    el.addEventListener('click', () => {
      lbc.innerHTML = `<video src="${BASE}${v.file}" autoplay muted loop playsinline controls></video>`;
      lb.showModal();
    });
    grid.appendChild(el);
  });
  if (favsOnly && !items.length) {
    grid.insertAdjacentHTML('beforeend',
      '<div class="g-empty">No favourites yet. Hover a post and click its ♥ to keep it here.</div>');
  }
  const nb = document.createElement('button');
  nb.className = 'g-new';
  nb.innerHTML = '<span class="plus">+</span><span class="lb2">New post</span>';
  nb.onclick = createFromTemplate;
  grid.appendChild(nb);
  fitPreviews();
  setTimeout(fitPreviews, 60);
}

/* ---- new post: start from the brand template right here, or ideate with Claude ---- */
/* New post: build the brand's template asset and open it straight away.
   Anything the template cannot give is ideated in Claude Code — the tip card
   in the editor explains how. */
function createFromTemplate() {
  const fmt = CONFIG.fmts[0][0];
  const [, , bgc, light] = (CONFIG.flats || [['', '', '#ffffff', true]])[0];
  const bg = bgc === 'orbs' ? { orbs: true }
    : (CONFIG.toneClass || 'light') === 'dark'
      ? (light ? { flat: bgc } : { flat: bgc, dark: true })
      : (light ? { flat: bgc, light: true } : { flat: bgc });
  const wkeys = Object.keys(CONFIG.widgets || {});
  const widget = CONFIG.newPostWidget && wkeys.includes(CONFIG.newPostWidget)
    ? CONFIG.newPostWidget
    : (wkeys.includes('best-match') ? 'best-match' : wkeys[0]);
  const a = {
    id: nextCopyId(), name: 'new-post', kind: 'New post', type: 'post', fmt,
    slides: [{
      fmt, bg,
      eyebrow: CONFIG.name,
      title: 'Your headline goes here.',
      ...(widget
        ? { widget }
        : { body: 'Click any text to edit it. Backgrounds and layers live in the right panel.' }),
    }],
  };
  stamp(a); store.copies.push(a); save();
  buildGrid(); buildHeader();
  openEditor(a.id, true);
}

const tipcard = document.getElementById('tipcard');
document.getElementById('tipx').onclick = () => { tipcard.hidden = true; };
/* the tip card tells people how to have THEIR Claude add posts here:
   the machine guide ships with the tool, so the link is always right */
{
  const guide = new URL('../claude-guide.md', location.href).href;
  const el = document.getElementById('tipurl');
  el.textContent = guide.replace(/^https?:\/\//, '');
  el.onclick = () => {
    navigator.clipboard?.writeText(guide);
    const was = el.textContent; el.textContent = 'copied ✓';
    setTimeout(() => { el.textContent = was; }, 1200);
  };
}
document.getElementById('newtop').onclick = createFromTemplate;
document.getElementById('favfilter').onclick = () => {
  favsOnly = !favsOnly;
  buildHeader(); buildGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
lb.addEventListener('close', () => { lbc.innerHTML = ''; });

/* ---------- editor ---------- */
const ed = document.getElementById('ed'), stage = document.getElementById('stage');
const rail = document.getElementById('rail'), side = document.getElementById('side');
const edwrap = document.getElementById('edwrap');
window.ed = ed;
let cur = null, sel = 0, cache = {}, dirty = false;

function injectCss() {
  document.getElementById('edcss')?.remove();
  const st = document.createElement('style');
  st.id = 'edcss';
  st.textContent = scopeCss(CONFIG.css(cur.slides[sel].fmt, BASE), '#stage');
  document.head.appendChild(st);
}
function fit() {
  if (!cur) return;
  const box = document.getElementById('stagebox');
  const { w, h } = FMT[cur.slides[sel].fmt];
  const s = Math.min((box.clientWidth - 10) / w, (box.clientHeight - 10) / h, 1);
  stage.style.width = w + 'px'; stage.style.height = h + 'px';
  stage.style.transform = `translate(-50%,-50%) scale(${Math.max(s, 0.05)})`;
}
window.addEventListener('resize', () => { if (ed.open) fit(); });
new ResizeObserver(() => { if (ed.open) fit(); }).observe(document.getElementById('stagebox'));

function makeEditable() {
  // A block is editable when it holds no nested block of its own. Inline children (em/b/span
  // accents, e.g. a colored <em> inside a headline) stay inside the editable block.
  const INLINE = new Set(['EM', 'B', 'I', 'STRONG', 'SPAN', 'BR', 'SMALL', 'U']);
  stage.querySelectorAll('h1, h2, p, div.d, div.metric, span.eyebrow, span.mono, span.ser, span.body').forEach(el => {
    if (el.closest('.brand')) return;
    if ([...el.children].some(c => !INLINE.has(c.tagName))) return;   // has a nested block: skip
    if (el.parentElement?.isContentEditable) return;                  // already inside an editable
    el.contentEditable = 'true';
    el.addEventListener('input', touch);
  });
  /* Any remaining text spans (brand templates vary). A container counts as
     one editable block only when it carries text of its OWN next to inline
     children — e.g. a table header cell "2000" with an <i>Early internet</i>
     sub-label. Containers whose text all lives in child elements are left
     alone so those children stay individually editable. */
  const ownText = (el) => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  stage.querySelectorAll('span, b, i, strong, small').forEach(el => {
    if (el.closest('.brand') || el.isContentEditable) return;
    if (el.children.length && !(ownText(el) && [...el.children].every(c => INLINE.has(c.tagName)))) return;
    if (!el.textContent.trim()) return;
    el.contentEditable = 'true';
    el.addEventListener('input', touch);
  });
}
function cardEl() { return stage.querySelector('.card'); }
function fmtOf() { return cur.slides[sel].fmt; }

function snapshot() {
  if (!dirty && typeof cache[sel] === 'string') return;
  const card = cardEl();
  if (!card) return;
  const c = card.cloneNode(true);
  c.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
  cache[sel] = c.outerHTML;
  dirty = false;
}

/* ---------- autosave: every edit persists as an override for this asset ---------- */
let saveT = null;
function autosave() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    if (!cur) return;
    snapshot();
    const savedHtml = cur.slides.map((_, i) => cache[i] ?? null);
    const rec = clone({ ...cur, savedHtml });
    const existing = store.copies.find(c => c.id === cur.id);
    if (existing) { Object.assign(existing, rec); stamp(existing); save(); }
    else {
      // first edit of a built-in post: keep the override in place of the original,
      // remembering WHICH version of the template it was based on (see reconcileOverrides)
      const original = CONFIG.assets.find(a => a.id === cur.id);
      if (original) rec.baseSig = specSig(original);
      stamp(rec); store.copies.push(rec);
      store.hidden[cur.id] = 1;
      save();
    }
    buildGrid(); buildHeader();
  }, 600);
}
function touch() { dirty = true; autosave(); }
function render() {
  if (typeof clearHi === 'function') clearHi();
  injectCss();
  stage.innerHTML = typeof cache[sel] === 'string' ? cache[sel] : CONFIG.renderSlide(cur.slides[sel], BASE);
  dirty = false;
  makeEditable();
  fit();
  buildRail();
  buildSidebar();
}
function switchTo(i) { snapshot(); sel = Math.max(0, Math.min(i, cur.slides.length - 1)); render(); }

/* ---------- slide rail: thumbnails + drag-and-drop reorder ---------- */
function slideHtml(i) {
  return typeof cache[i] === 'string' ? cache[i] : CONFIG.renderSlide(cur.slides[i], BASE);
}
function reorder(from, to) {
  if (from === to) return;
  snapshot();
  const items = cur.slides.map((s, i) => ({ s, c: cache[i] }));
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  cur.slides = items.map(x => x.s);
  cache = {};
  items.forEach((x, i) => { if (typeof x.c === 'string') cache[i] = x.c; });
  sel = to;
  render();
  touch();
}
function buildRail() {
  const showRail = cur.type === 'carousel' || cur.slides.length > 1;
  edwrap.classList.toggle('has-rail', showRail);
  if (!showRail) { rail.innerHTML = ''; fit(); return; }
  rail.innerHTML = '<div class="rl-h">Slides · drag to reorder</div>';
  const RW = 141;                               // rail thumb content width
  cur.slides.forEach((s, i) => {
    const { w, h } = FMT[s.fmt];
    ensurePreviewCss(s.fmt);
    const b = document.createElement('div');
    b.className = 's' + (i === sel ? ' sel' : '');
    b.draggable = true;
    b.innerHTML = `<span class="n">${i + 1}</span>
      <div class="rpv pv-${s.fmt}" style="height:${Math.round(RW * h / w)}px"></div>`;
    const rpv = b.querySelector('.rpv');
    rpv.innerHTML = slideHtml(i);
    if (rpv.firstElementChild) rpv.firstElementChild.style.transform = `scale(${RW / w})`;
    b.onclick = () => switchTo(i);
    b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; });
    b.addEventListener('dragover', (e) => { e.preventDefault(); b.classList.add('dragover'); });
    b.addEventListener('dragleave', () => b.classList.remove('dragover'));
    b.addEventListener('drop', (e) => {
      e.preventDefault(); b.classList.remove('dragover');
      const from = Number(e.dataTransfer.getData('text/plain'));
      reorder(from, i);
    });
    rail.appendChild(b);
  });
  const ops = document.createElement('div');
  ops.className = 'ops';
  const mk = (t, fn, title) => { const x = document.createElement('button'); x.textContent = t; x.title = title; x.onclick = fn; return x; };
  ops.append(
    mk('+ duplicate', () => { snapshot(); cur.slides.splice(sel + 1, 0, clone(cur.slides[sel])); const nc = {}; Object.keys(cache).forEach(k => { const n = +k; nc[n > sel ? n + 1 : n] = cache[k]; }); nc[sel + 1] = cache[sel]; cache = nc; sel++; render(); touch(); }, 'Duplicate slide'),
    mk('✕ delete', () => { if (cur.slides.length > 1) { cur.slides.splice(sel, 1); const nc = {}; Object.keys(cache).forEach(k => { const n = +k; if (n === sel) return; nc[n > sel ? n - 1 : n] = cache[k]; }); cache = nc; sel = Math.min(sel, cur.slides.length - 1); dirty = false; render(); touch(); } }, 'Delete slide'),
  );
  rail.appendChild(ops);
}

/* ---------- backgrounds & layers (right panel) ---------- */
function hasGrad() { return !!stage.querySelector('img.grad'); }
function hasBlur() { return !!stage.querySelector('.bglayer img.bg.blur'); }
function hasLogo() { return !!stage.querySelector('.card .brand'); }
function setGrad(on) {
  const c = cardEl(); const layer = c.querySelector('.bglayer');
  layer.querySelector('img.grad')?.remove();
  if (on) {
    const overPhoto = !!layer.querySelector('img.bg');
    const img = document.createElement('img');
    img.className = 'grad';
    img.src = `${BASE}gradients/grad-${overPhoto ? 'alpha' : 'solid'}-${fmtOf()}.png`;
    layer.appendChild(img);
    if (!overPhoto) { setTone(c, false); c.style.background = CONFIG.darkFlat; }
  }
  touch(); syncToggles();
}
function hasOrbs() { return !!stage.querySelector('.bglayer .orbs'); }
function setOrbs(on) {
  const c = cardEl(); const layer = c.querySelector('.bglayer');
  layer.querySelector('.orbs')?.remove();
  if (on) {
    layer.insertAdjacentHTML('afterbegin', '<div class="orbs"><i></i></div>');
    setTone(c, false); c.classList.add('wash');
  } else {
    c.classList.remove('wash');
    if (!layer.querySelector('img.bg')) setTone(c, true);
  }
  touch(); syncToggles();
}
function setBlur(on) {
  const bg = cardEl().querySelector('.bglayer img.bg');
  if (bg) { bg.classList.toggle('blur', on); touch(); }
  syncToggles();
}
function setLogo(on) {
  const c = cardEl();
  const brand = c.querySelector('.brand');
  if (!on && brand) brand.remove();
  if (on && !brand && CONFIG.brandHtml) c.insertAdjacentHTML('beforeend', CONFIG.brandHtml(BASE));
  touch(); syncToggles();
}
function setPhoto(p) {
  const c = cardEl(); const keepGrad = hasGrad(); const keepBlur = hasBlur();
  c.querySelector('.bglayer').innerHTML =
    `<img class="bg${keepBlur ? ' blur' : ''}" src="${BASE}${CONFIG.photoRoot ?? ''}${p}"><div class="scrim"></div>`;
  setTone(c, false); c.style.background = CONFIG.darkFlat;
  if (keepGrad) setGrad(true);
  touch(); syncToggles();
}
/* Brands disagree on which class marks the non-default tone: some default
   to a dark card and use .light for pale ones; others default to white and use
   .dark. CONFIG.toneClass says which, so a background swatch always flips the
   text with it. */
function setTone(card, isLight) {
  if ((CONFIG.toneClass || 'light') === 'dark') card.classList.toggle('dark', !isLight);
  else card.classList.toggle('light', !!isLight);
}
function setFlat(glow, bgc, light) {
  const c = cardEl();
  c.querySelector('.bglayer').innerHTML = glow
    ? `<div class="glow" style="background:radial-gradient(circle, ${glow}30 0%, transparent 65%);"></div>` : '';
  c.style.background = bgc;
  c.classList.remove('wash');
  setTone(c, light);
  touch(); syncToggles();
}
function syncToggles() {
  const set = (id, on) => document.getElementById(id)?.classList.toggle('on', on);
  set('tg-grad', hasGrad());
  set('tg-orbs', hasOrbs());
  set('tg-blur', hasBlur());
  set('tg-logo', hasLogo());
}
function currentWidgetKey() {
  const w = stage.querySelector('.card .w');
  return w ? (w.dataset.w || '?') : null;
}
const wHtml = (key) => (CONFIG.widgetHtml ? CONFIG.widgetHtml(key) : CONFIG.widgets?.[key]?.html?.());
function setWidget(key) {
  const card = cardEl();
  const existing = card.querySelector('.w');
  const html = wHtml(key);
  if (!html) return;
  if (existing) {
    existing.outerHTML = html;                  // swap in place
  } else {
    // insert into the content stack, after the headline if there is one
    const content = card.querySelector('div[style*="flex-direction:column"]') || card.lastElementChild;
    const anchor = content.querySelector('h1, .metric');
    if (anchor) anchor.insertAdjacentHTML('afterend', html);
    else content.insertAdjacentHTML('beforeend', html);
  }
  touch(); buildSidebar();
}
function removeWidget() {
  stage.querySelector('.card .w')?.remove();
  touch(); buildSidebar();
}

function buildSidebar() {
  // ---- background first: it sets the whole mood of the post ----
  side.innerHTML = '<div class="sd-h">Background</div>';
  const sw = document.createElement('div'); sw.className = 'swatches';
  (CONFIG.flats || []).forEach(([label, glow, bgc, light]) => {
    const b = document.createElement('button');
    if (bgc === 'orbs') {   // the brand wash offered as a background, not a layer
      b.style.background = 'linear-gradient(118deg, #4e71ff 0%, #954eff 52%, #4ea9ff 100%)';
      b.style.color = '#fff';
      b.onclick = () => setOrbs(true);
    } else {
      b.style.background = glow ? `radial-gradient(circle at 50% 20%, ${glow}55, ${bgc} 70%)` : bgc;
      b.style.color = light ? '#101015' : '#fff';
      b.onclick = () => setFlat(glow, bgc, light);
    }
    b.textContent = label;
    sw.appendChild(b);
  });
  side.appendChild(sw);
  Object.entries(CONFIG.photoGroups || {}).forEach(([grp, files]) => {
    const h = document.createElement('div'); h.className = 'sd-h'; h.textContent = grp; side.appendChild(h);
    const g = document.createElement('div'); g.className = 'swatches';
    files.forEach(p => {
      const b = document.createElement('button');
      b.style.backgroundImage = `url(${BASE}${CONFIG.photoRoot ?? ''}${p})`; b.title = p;
      b.onclick = () => setPhoto(p);
      g.appendChild(b);
    });
    side.appendChild(g);
  });

  side.insertAdjacentHTML('beforeend', '<div class="sd-h">Layers</div>');
  const tg = document.createElement('div'); tg.className = 'toggles';
  const mkT = (id, label, fn) => {
    const b = document.createElement('button');
    b.id = id; b.innerHTML = `${label} <span class="sw"></span>`;
    b.onclick = fn; return b;
  };
  if (CONFIG.gradient) tg.appendChild(mkT('tg-grad', 'Gradient', () => setGrad(!hasGrad())));
  if (CONFIG.orbs) tg.appendChild(mkT('tg-orbs', 'Brand wash', () => setOrbs(!hasOrbs())));
  if (CONFIG.blurBg) tg.appendChild(mkT('tg-blur', 'Blur background', () => setBlur(!hasBlur())));
  tg.appendChild(mkT('tg-logo', 'Logo', () => setLogo(!hasLogo())));
  side.appendChild(tg);

  // ---- product illustrations: insert / swap / remove ----
  // The section is always there. Brands start with none: Claude fills the slot
  // (WIDGETS in the brand file) when asked, so the empty state says exactly that.
  side.insertAdjacentHTML('beforeend', '<div class="sd-h">Product illustration</div>');
  if (!CONFIG.widgets || !Object.keys(CONFIG.widgets).length) {
    side.insertAdjacentHTML('beforeend',
      '<div class="wempty"><b>None yet.</b> Ask Claude to generate illustrations of your product.</div>');
  } else {
    const wl = document.createElement('div'); wl.className = 'wlist';
    const active = currentWidgetKey();
    const pvFmt = cur ? fmtOf() : CONFIG.fmts[0][0];
    ensurePreviewCss(pvFmt);
    const NAT = FMT[pvFmt].w;                       // widgets are authored at card width
    Object.entries(CONFIG.widgets).forEach(([k, def]) => {
      const b = document.createElement('button');
      b.className = 'wcard' + (k === active ? ' on' : '');
      b.innerHTML = `<span class="wpv pv-${pvFmt}"></span><span class="wlb">${def.label || k}</span>`;
      const pv = b.querySelector('.wpv');
      pv.innerHTML = wHtml(k);
      wl.appendChild(b);
      const inner = pv.firstElementChild;
      if (inner) inner.style.width = NAT + 'px';
      b.onclick = () => (k === active ? removeWidget() : setWidget(k));
    });
    if (active) {
      const b = document.createElement('button');
      b.className = 'wclear';
      b.textContent = '✕ remove illustration';
      b.onclick = removeWidget;
      wl.appendChild(b);
    }
    side.appendChild(wl);
  }

  const rb = document.createElement('button');
  rb.className = 'reset';
  rb.textContent = '↺ Reset to original';
  rb.onclick = resetToOriginal;
  side.appendChild(rb);
  syncToggles();
  sizeWidgetPreviews();
  setTimeout(sizeWidgetPreviews, 60);        // once the dialog has real layout
  if (document.fonts) document.fonts.ready.then(sizeWidgetPreviews);
}

/* Scale each product-illustration preview down to the panel width and lock its box
   to the scaled height, so the sidebar shows the real thing, not a text label. */
function sizeWidgetPreviews() {
  document.querySelectorAll('#side .wcard .wpv').forEach(pv => {
    const inner = pv.firstElementChild;
    if (!inner) return;
    const laidOut = parseFloat(inner.style.width) || inner.offsetWidth;
    const natH = inner.offsetHeight;
    const boxW = pv.clientWidth, boxH = pv.clientHeight;
    if (!boxW || !boxH || !laidOut || !natH) return;
    // cards cap themselves below the card width, so fit to the INK, not the box
    const capped = parseFloat(getComputedStyle(inner).maxWidth);
    const natW = capped && capped < laidOut ? capped : laidOut;
    const scale = Math.min(boxW / natW, boxH / natH) * 0.94;
    const x = (boxW - natW * scale) / 2, y = (boxH - natH * scale) / 2;
    inner.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  });
}

/* ---------- reset: back to the post exactly as it was designed ---------- */
function resetToOriginal() {
  const original = CONFIG.assets.find(a => a.id === cur.id)
    || CONFIG.assets.find(a => a.name && a.name === cur.name);
  if (!original) { alert('This post was created as a copy, so it has no original to reset to.'); return; }
  if (!confirm('Discard all edits and restore this post as it was originally designed?')) return;
  cur = clone(original);
  cur.id = original.id;
  sel = Math.min(sel, cur.slides.length - 1);
  cache = {}; dirty = false;
  store.copies = store.copies.filter(c => c.id !== cur.id);
  delete store.hidden[cur.id];
  save();
  render(); buildSidebar(); buildGrid(); buildHeader();
}

/* ---------- remove any block: hover a block in the stage, click its ✕ ---------- */
const rmbtn = document.getElementById('rmbtn');
let rmTarget = null;

function blockUnder(el) {
  // walk up to the nearest removable block: a stack item, the widget, the logo or the index
  const card = cardEl();
  if (!card || !card.contains(el)) return null;
  const content = card.querySelector('div[style*="flex-direction:column"]');
  let n = el;
  while (n && n !== card) {
    if (n.classList?.contains('w') || n.classList?.contains('brand') || n.classList?.contains('idx')) return n;
    if (content && n.parentElement === content) return n;
    n = n.parentElement;
  }
  return null;
}
function clearHi() {
  stage.querySelector('.blk-hi')?.classList.remove('blk-hi');
  rmbtn.classList.remove('show');
  rmTarget = null;
}
stage.addEventListener('mousemove', (e) => {
  if (!cur) return;
  const blk = blockUnder(e.target);
  if (!blk) { if (rmTarget && !rmbtn.matches(':hover')) clearHi(); return; }
  if (blk === rmTarget) return;
  stage.querySelector('.blk-hi')?.classList.remove('blk-hi');
  blk.classList.add('blk-hi');
  rmTarget = blk;
  // position the ✕ at the block's top-right, in stagebox coordinates
  const box = document.getElementById('stagebox').getBoundingClientRect();
  const r = blk.getBoundingClientRect();
  rmbtn.style.left = `${r.right - box.left - 11}px`;
  rmbtn.style.top = `${r.top - box.top - 11}px`;
  rmbtn.classList.add('show');
});
document.getElementById('stagebox').addEventListener('mouseleave', clearHi);
rmbtn.onclick = () => {
  if (!rmTarget) return;
  rmTarget.remove();
  clearHi();
  touch(); buildSidebar();
};

/* ---------- read the edited card back into its spec ----------
   Every text block is rendered with data-f="<field>", so the user's edits (and any block
   they deleted) can be folded back into the slide spec. That lets us re-render at a new
   size and KEEP the edits, with typography rescaled properly for the new format. */
const TEXT_FIELDS = ['eyebrow', 'kicker', 'serif', 'title', 'em', 'big', 'body', 'bottom'];
function harvestSpec() {
  const card = cardEl();
  if (!card || !cur) return;
  const s = cur.slides[sel];
  const tagged = card.querySelectorAll('[data-f]');
  // Legacy safety: HTML autosaved before fields were tagged has no [data-f] at all.
  // Harvesting text from it would wipe the spec, so keep the spec's copy as-is and
  // only pick up the background / widget / logo state below (that is DOM-derived).
  const seen = new Set();
  if (tagged.length) tagged.forEach(el => {
    const f = el.dataset.f;
    if (f === 'em') return;                       // handled with its title
    seen.add(f);
    if (f === 'title') {
      const em = el.querySelector('[data-f="em"]');
      if (em) { s.em = em.textContent.trim(); seen.add('em'); }
      const c = el.cloneNode(true);
      c.querySelector('[data-f="em"]')?.remove();
      s.title = c.textContent.trim();
    } else {
      s[f] = el.textContent.trim();
    }
  });
  if (tagged.length) TEXT_FIELDS.forEach(f => { if (s[f] !== undefined && !seen.has(f)) delete s[f]; });

  const w = card.querySelector('.w[data-w]');
  if (w) s.widget = w.dataset.w; else delete s.widget;
  s.logo = !!card.querySelector('.brand');

  const layer = card.querySelector('.bglayer');
  const img = layer?.querySelector('img.bg');
  const bg = {};
  if (img) {
    bg.photo = img.getAttribute('src').replace(BASE, '').replace(CONFIG.photoRoot ?? '', '');
    if (img.classList.contains('blur')) bg.blur = true;
  } else if (layer?.querySelector('.orbs')) {
    bg.orbs = true;
  } else if (card.style.background) {
    bg.flat = card.style.background;
  }
  if (layer?.querySelector('img.grad')) bg.gradient = true;
  if ((CONFIG.toneClass || 'light') === 'dark') { if (card.classList.contains('dark')) bg.dark = true; }
  else if (card.classList.contains('light')) bg.light = true;
  s.bg = bg;
}

/* ---------- fmt switch: re-render at the new size, keeping the edits ---------- */
const fmtsel = document.getElementById('fmtsel');
fmtsel.onchange = () => {
  harvestSpec();                       // fold the current edits into the spec first
  cache = {}; dirty = false;           // drop the old-size HTML, the spec carries the content
  cur.slides.forEach(s => { s.fmt = fmtsel.value; });
  render();
  touch();
};

function openEditor(id, isNew) {
  const src = findAsset(id);
  if (!src) return;
  cur = clone(src);
  sel = 0; dirty = false;
  cache = {};
  (src.savedHtml || []).forEach((h, i) => { if (typeof h === 'string') cache[i] = h; });
  fmtsel.innerHTML = '';
  if (cur.type === 'post') {
    CONFIG.fmts.forEach(([f, label]) => {
      const o = document.createElement('option'); o.value = f; o.textContent = label; fmtsel.appendChild(o);
    });
    fmtsel.value = cur.slides[0].fmt;
    // custom assets carry their own full-card HTML: no spec to re-render from
    fmtsel.style.display = src.custom ? 'none' : '';
  } else fmtsel.style.display = 'none';
  document.getElementById('pdfbtn').style.display = cur.type === 'carousel' ? '' : 'none';
  buildSidebar();
  tipcard.hidden = !isNew;
  ed.showModal();
  setTimeout(render, 0);
  setTimeout(fit, 150);
  document.fonts.ready.then(() => setTimeout(fit, 50));
}
ed.addEventListener('close', () => { document.getElementById('edcss')?.remove(); stage.innerHTML = ''; cur = null; cache = {}; });

/* ---------- exports ---------- */
document.getElementById('pngbtn').onclick = async () => {
  snapshot();
  const { w, h } = FMT[fmtOf()];
  const url = await htmlToImage.toPng(cardEl(), { width: w, height: h, pixelRatio: 2 });
  dlUrl(url, `${slug(cur)}${cur.slides.length > 1 ? '-s' + (sel + 1) : ''}.png`);
};

document.getElementById('pdfbtn').onclick = async () => {
  snapshot();
  const btn = document.getElementById('pdfbtn'); const t = btn.textContent; btn.textContent = 'Rendering…';
  try {
    const { w, h } = FMT[cur.slides[0].fmt];
    const pdf = new jspdf.jsPDF({ unit: 'px', format: [w, h], orientation: h >= w ? 'portrait' : 'landscape', hotfixes: ['px_scaling'] });
    const remembered = sel;
    for (let i = 0; i < cur.slides.length; i++) {
      switchTo(i);
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 260));
      const url = await htmlToImage.toJpeg(cardEl(), { width: w, height: h, pixelRatio: 2, quality: 0.9, backgroundColor: CONFIG.darkFlat });
      if (i > 0) pdf.addPage([w, h]);
      pdf.addImage(url, 'JPEG', 0, 0, w, h);
      btn.textContent = `Rendering ${i + 1}/${cur.slides.length}…`;
    }
    switchTo(remembered);
    pdf.save(`${slug(cur)}.pdf`);
  } catch (e) { alert('PDF failed: ' + e); }
  btn.textContent = t;
};

/* 6s ken-burns video: bg layer slowly zooms, content fades and rises in */
document.getElementById('vidbtn').onclick = async () => {
  snapshot();
  const btn = document.getElementById('vidbtn'); const t = btn.textContent; btn.textContent = 'Capturing…';
  try {
    const card = cardEl();
    const { w, h } = FMT[fmtOf()];
    const bgl = card.querySelector('.bglayer');
    const others = [...card.children].filter(el => el !== bgl);

    others.forEach(el => { el.style.visibility = 'hidden'; });
    const bgUrl = await htmlToImage.toPng(card, { width: w, height: h, pixelRatio: 1 });
    others.forEach(el => { el.style.visibility = ''; });

    bgl.style.visibility = 'hidden';
    const prevBg = card.style.background;
    card.style.background = 'transparent';
    const fgUrl = await htmlToImage.toPng(card, { width: w, height: h, pixelRatio: 1 });
    bgl.style.visibility = ''; card.style.background = prevBg;

    const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    const [bgImg, fgImg] = await Promise.all([load(bgUrl), load(fgUrl)]);

    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const stream = cv.captureStream(30);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise(res => { rec.onstop = res; });
    rec.start();

    const DUR = 6000, t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    btn.textContent = 'Recording…';
    await new Promise(resolve => {
      (function frame(now) {
        const p = Math.min(1, (now - t0) / DUR);
        const sc = 1.05 + 0.07 * p;
        const bw = w * sc, bh = h * sc;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bgImg, (w - bw) / 2, (h - bh) / 2, bw, bh);
        const fp = ease(Math.min(1, (now - t0) / 1300));
        ctx.globalAlpha = fp;
        ctx.drawImage(fgImg, 0, (1 - fp) * 26, w, h);
        ctx.globalAlpha = 1;
        if (p < 1) requestAnimationFrame(frame); else resolve();
      })(t0);
    });
    rec.stop();
    await done;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(cur)}${cur.slides.length > 1 ? '-s' + (sel + 1) : ''}.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  } catch (e) { alert('Video failed: ' + e); }
  btn.textContent = t;
};

reconcileOverrides();
buildHeader();
buildGrid();
