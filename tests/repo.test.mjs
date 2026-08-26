import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (p) => readFileSync(root + p, "utf8");

describe("the studio stays offline", () => {
  // The README promises "no server and nothing goes online". These tests are
  // what make that a checkable claim rather than a hopeful sentence.
  const shipped = ["studio/studio.mjs", "studio/pure.mjs", "brands/registry.mjs"];

  for (const file of shipped) {
    test(`${file} makes no network calls`, () => {
      const src = read(file);
      for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket(", "EventSource("]) {
        assert.ok(!src.includes(api), `${file} uses ${api}`);
      }
    });
  }

  test("no analytics or tracker scripts in the pages", () => {
    for (const page of ["index.html", "studio/index.html"]) {
      const src = read(page).toLowerCase();
      for (const tracker of ["googletagmanager", "google-analytics", "segment.", "hotjar", "mixpanel", "clarity.ms"]) {
        assert.ok(!src.includes(tracker), `${page} references ${tracker}`);
      }
    }
  });

  test("start scripts bind to loopback only", () => {
    // Without --bind, python's http.server listens on every interface and the
    // whole folder is readable by anyone on the same wifi.
    for (const script of ["start-mac.command", "start-windows.bat"]) {
      const src = read(script);
      const servers = src.split("\n").filter((l) => l.includes("http.server"));
      assert.ok(servers.length > 0, `${script} starts no server`);
      for (const line of servers) {
        assert.ok(line.includes("--bind 127.0.0.1"), `${script}: ${line.trim()}`);
      }
    }
  });
});

describe("the port is picked, remembered, and rechecked", () => {
  // Low fixed ports collide with whatever else the founder is running, and a
  // port that changes every start makes the URL unbookmarkable.
  const launchers = ["start-mac.command", "start-windows.bat"];

  for (const script of launchers) {
    test(`${script} remembers the port in .dev-port`, () => {
      assert.match(read(script), /\.dev-port/);
    });

    test(`${script} picks from a high range, not a fixed low port`, () => {
      const src = read(script);
      assert.match(src, /20000/, "no high base port");
      assert.match(src, /RANDOM/, "port is not randomised");
    });

    test(`${script} rechecks a remembered port before reusing it`, () => {
      // Reusing a port without checking is how you get EADDRINUSE on start.
      const src = read(script);
      assert.ok(
        /lsof|netstat/.test(src),
        `${script} never probes whether the port is free`
      );
    });
  }

  test(".dev-port is git-ignored", () => {
    assert.match(read(".gitignore"), /^\.dev-port$/m);
  });
});

describe("it runs by double-click", () => {
  test("the mac launcher is executable in git", () => {
    // A launcher without the exec bit fails silently on a fresh clone.
    assert.ok(statSync(root + "start-mac.command").mode & 0o111);
  });

  test("both launchers exist", () => {
    assert.ok(existsSync(root + "start-mac.command"));
    assert.ok(existsSync(root + "start-windows.bat"));
  });

  test(".nojekyll is present so GitHub Pages serves every path", () => {
    assert.ok(existsSync(root + ".nojekyll"));
  });
});

describe("brand registry", () => {
  test("every registered brand has a studio.mjs", async () => {
    const { BRANDS } = await import("../brands/registry.mjs");
    assert.ok(BRANDS.length > 0, "no brands registered");
    for (const brand of BRANDS) {
      assert.ok(
        existsSync(`${root}brands/${brand}/studio.mjs`),
        `brands/${brand}/studio.mjs is missing`
      );
    }
  });

  test("every brand folder on disk is registered", async () => {
    // An unregistered folder is invisible to the studio — silently dead work.
    const { BRANDS } = await import("../brands/registry.mjs");
    const onDisk = readdirSync(root + "brands", { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const folder of onDisk) {
      assert.ok(BRANDS.includes(folder), `brands/${folder} is not in BRANDS`);
    }
  });

  test("each brand exports a CONFIG with a css function", async () => {
    const { BRANDS } = await import("../brands/registry.mjs");
    for (const brand of BRANDS) {
      const { CONFIG } = await import(`../brands/${brand}/studio.mjs`);
      assert.ok(CONFIG, `${brand}: no CONFIG export`);
      assert.equal(typeof CONFIG.css, "function", `${brand}: CONFIG.css is not a function`);
      assert.ok(CONFIG.base, `${brand}: CONFIG.base is missing`);
    }
  });
});

describe("local assets resolve", () => {
  test("every local src/href in the studio page exists on disk", () => {
    const src = read("studio/index.html");
    const refs = [...src.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((r) => !/^(https?:|data:|#|mailto:)/.test(r));
    assert.ok(refs.length > 0, "no local references found");
    for (const ref of refs) {
      const path = root + "studio/" + ref.split("?")[0];
      assert.ok(existsSync(path), `studio/index.html references missing ${ref}`);
    }
  });
});
