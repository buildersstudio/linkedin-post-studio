/* Logic with no DOM and no browser globals, so it can be tested with `node --test`.
   Everything else in studio.mjs touches the document or localStorage.

   Typed with JSDoc rather than TypeScript: this tool ships as plain ES modules a
   browser loads directly, and a compile step would end the download-and-double-click
   promise the README makes. Editors read these annotations the same way. */

/**
 * Rewrites a stylesheet so every rule applies only inside `scope`.
 *
 * Hand-rolled rather than regex, because rules nest: a selector's body can contain
 * further braces (`@media`, `@supports`), and a naive split loses them. At-rules are
 * passed through unscoped — prefixing `@media` would produce invalid CSS.
 *
 * @param {string} raw   Stylesheet source.
 * @param {string} scope Selector to prefix every rule with, e.g. `"#stage"`.
 * @returns {string} The rewritten stylesheet. Empty when `raw` contains no rules.
 */
export function scopeCss(raw, scope) {
  let out = '', i = 0;
  while (i < raw.length) {
    const open = raw.indexOf('{', i);
    if (open === -1) break;
    const prelude = raw.slice(i, open);
    let depth = 0, j = open;
    for (; j < raw.length; j++) {
      if (raw[j] === '{') depth++;
      else if (raw[j] === '}') { depth--; if (depth === 0) break; }
    }
    const body = raw.slice(open, j + 1);
    out += prelude.trim().startsWith('@') ? prelude + body
      : '\n' + prelude.trim().split(',').map(s => scope + ' ' + s.trim()).filter(Boolean).join(', ') + body;
    i = j + 1;
  }
  return out;
}

/**
 * A post, as stored in localStorage and rendered in the gallery.
 * @typedef {object} Asset
 * @property {number} id     Stable per-brand identifier.
 * @property {string} [name] Human title. Falls back to `kind` when absent.
 * @property {string} [kind] Template the post was created from.
 */

/**
 * Filename for a downloaded post: brand, zero-padded id, then a slugified label.
 *
 * @param {string} vkey  Brand key, e.g. `"builders"`.
 * @param {Asset}  asset The post being exported.
 * @returns {string} Slug safe for a filename, label truncated to 40 characters.
 */
export function assetSlug(vkey, asset) {
  const label = (asset.name || asset.kind || '').toLowerCase();
  return `${vkey}-${String(asset.id).padStart(2, '0')}-${label.replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;
}

/**
 * Which brand the studio opens with.
 *
 * `?v=` wins when it names a registered brand, otherwise the first one — so a shared
 * link to a brand someone has since removed still opens the studio instead of failing.
 *
 * @param {string}   search Query string, including the leading `?`. `location.search`.
 * @param {string[]} brands Registered brand keys, from `brands/registry.mjs`.
 * @returns {string} The brand key to load.
 */
export function pickBrand(search, brands) {
  const requested = new URLSearchParams(search).get('v');
  return requested && brands.includes(requested) ? requested : brands[0];
}
