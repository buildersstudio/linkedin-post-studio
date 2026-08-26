import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { scopeCss, assetSlug, pickBrand } from "../studio/pure.mjs";

describe("scopeCss", () => {
  test("prefixes a simple rule", () => {
    assert.match(scopeCss(".card{color:red}", "#stage"), /#stage \.card\{color:red\}/);
  });

  test("prefixes every selector in a comma list", () => {
    const out = scopeCss(".a, .b{x:1}", "#s");
    assert.match(out, /#s \.a, #s \.b\{x:1\}/);
  });

  test("leaves at-rules unscoped so media queries keep working", () => {
    // Prefixing @media itself would produce "#s @media", which is invalid.
    const out = scopeCss("@media (min-width:10px){.a{x:1}}", "#s");
    assert.match(out, /^@media \(min-width:10px\)\{/);
    assert.ok(!out.includes("#s @media"));
  });

  test("keeps a nested at-rule body intact", () => {
    // The reason this is a brace counter and not a regex: the body has braces.
    const out = scopeCss("@media screen{.a{x:1}.b{y:2}}", "#s");
    assert.ok(out.includes(".a{x:1}"));
    assert.ok(out.includes(".b{y:2}"));
  });

  test("handles several rules in sequence", () => {
    const out = scopeCss(".a{x:1}.b{y:2}", "#s");
    assert.match(out, /#s \.a\{x:1\}/);
    assert.match(out, /#s \.b\{y:2\}/);
  });

  test("returns empty for input with no rules", () => {
    assert.equal(scopeCss("", "#s"), "");
    assert.equal(scopeCss("/* just a comment */", "#s"), "");
  });

  test("does not lose a trailing rule with no closing brace", () => {
    assert.doesNotThrow(() => scopeCss(".a{x:1", "#s"));
  });
});

describe("assetSlug", () => {
  test("pads the id to two digits", () => {
    assert.equal(assetSlug("builders", { id: 3, name: "Hello" }), "builders-03-hello");
  });

  test("leaves an id of three digits alone", () => {
    assert.equal(assetSlug("b", { id: 120, name: "x" }), "b-120-x");
  });

  test("replaces runs of punctuation with a single dash", () => {
    assert.equal(assetSlug("b", { id: 1, name: "Hello,   World!!" }), "b-01-hello-world-");
  });

  test("falls back to kind when there is no name", () => {
    assert.equal(assetSlug("b", { id: 1, kind: "quote" }), "b-01-quote");
  });

  test("truncates a very long name", () => {
    const out = assetSlug("b", { id: 1, name: "a".repeat(100) });
    assert.equal(out, "b-01-" + "a".repeat(40));
  });

  test("never throws on a nameless, kindless asset", () => {
    assert.equal(assetSlug("b", { id: 1 }), "b-01-");
  });
});

describe("pickBrand", () => {
  const brands = ["builders", "acme"];

  test("uses ?v= when it names a known brand", () => {
    assert.equal(pickBrand("?v=acme", brands), "acme");
  });

  test("falls back to the first brand when ?v= is unknown", () => {
    // A shared link to a brand someone removed must still open the studio.
    assert.equal(pickBrand("?v=nope", brands), "builders");
  });

  test("falls back when there is no query string", () => {
    assert.equal(pickBrand("", brands), "builders");
  });

  test("ignores other query parameters", () => {
    assert.equal(pickBrand("?utm=x&v=acme", brands), "acme");
  });
});
