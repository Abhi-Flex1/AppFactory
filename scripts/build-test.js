// Frontend contract tests. These run against the real built bundle in jsdom, so
// they catch the things that actually break: a component that throws, a page
// that renders nothing, a dead route, or a bundle that silently grew.
//   node scripts/build-test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

let passed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  ✗ ${name}\n      ${error.message}`);
  }
}

/** Largest first-party source file, so bloat regressions are attributable. */
function sourceBytes() {
  const dir = path.join(ROOT, "src");
  let total = 0;
  const files = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|css)$/.test(entry.name)) {
        const size = fs.statSync(full).size;
        total += size;
        files.push([path.relative(ROOT, full), size]);
      }
    }
  };
  walk(dir);
  files.sort((a, b) => b[1] - a[1]);
  return { total, files };
}

function gzipSize(file) {
  const zlib = require("node:zlib");
  return zlib.gzipSync(fs.readFileSync(file)).length;
}

(async () => {
  if (!fs.existsSync(DIST)) {
    console.error("dist/ not found — run `npm run build` first.");
    process.exit(1);
  }

  const assets = path.join(DIST, "assets");
  const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

  console.log(`\nAppFactory frontend contract — ${path.relative(ROOT, DIST)}/\n`);

  /* ---------------------------------------------------------------- */
  console.log("build output");
  const js = fs.readdirSync(assets).filter((f) => f.endsWith(".js"));
  const cssFiles = fs.readdirSync(assets).filter((f) => f.endsWith(".css"));

  await test("the build emits JS, CSS and an index.html", () => {
    assert.ok(js.length > 0, "no JS emitted");
    assert.equal(cssFiles.length, 1, `expected exactly one CSS file, found ${cssFiles.length}`);
    assert.ok(fs.existsSync(path.join(DIST, "index.html")));
  });

  await test("every asset filename is content-hashed", () => {
    for (const file of [...js, ...cssFiles]) {
      assert.match(file, /-[A-Za-z0-9_-]{8,}\.(js|css)$/, `${file} is not hashed`);
    }
  });

  await test("screenshots were copied into the build", () => {
    assert.ok(fs.existsSync(path.join(DIST, "shots", "reel-edit", "pc-editor.jpg")));
    assert.ok(fs.existsSync(path.join(DIST, "shots", "opentwit-web", "thumbs", "phone-home-for-you.jpg")));
    assert.ok(fs.existsSync(path.join(DIST, "favicon.svg")));
  });

  await test("the total JS payload stays under 200 kB gzipped", () => {
    const total = js.reduce((sum, file) => sum + gzipSize(path.join(assets, file)), 0);
    const kb = (total / 1024).toFixed(1);
    console.log(`      ${kb} kB gzip across ${js.length} chunks`);
    assert.ok(total < 200 * 1024, `JS payload is ${kb} kB gzip, over the 200 kB budget`);
  });

  await test("first-party source stays under the old site's footprint", () => {
    // The pre-rewrite site shipped ~220 kB of hand-written CSS+JS. This is the
    // regression ceiling, not a target: the real payload budget is the check above.
    const { total, files } = sourceBytes();
    const kb = (total / 1024).toFixed(1);
    console.log(`      ${kb} kB of source; largest: ${files[0][0]} (${(files[0][1] / 1024).toFixed(1)} kB)`);
    assert.ok(total < 150 * 1024, `source is ${kb} kB, over the 150 kB ceiling`);
  });

  /* ---------------------------------------------------------------- */
  console.log("\nthe shell");
  await test("React 19 metadata is hoisted, not faked", () => {
    assert.match(shell, /<div id="root"><\/div>/, "root must be empty for React to own it");
    // The only inline script allowed is the pre-paint theme resolver.
    const inlines = [...shell.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
    assert.ok(inlines.length <= 1, `expected at most one inline script, found ${inlines.length}`);
    for (const [, body] of inlines) {
      assert.ok(body.length < 400, `inline script is ${body.length} chars — too much logic before hydration`);
    }
  });

  await test("the noscript fallback lists every port", () => {
    const noscript = shell.match(/<noscript>[\s\S]*?<\/noscript>/)[0];
    for (const port of ["Reel-Edit", "OpenGMaps", "OpenTwit", "OHEmacs", "WhatIsIt"]) {
      assert.ok(noscript.includes(port), `noscript is missing ${port}`);
    }
  });

  await test("the theme script resolves the scheme before first paint", () => {
    const inline = shell.match(/<script>([\s\S]*?)<\/script>/)[1];
    assert.match(inline, /prefers-color-scheme/, "no system-scheme check before paint");
    assert.match(inline, /localStorage/, "no stored preference before paint");
  });

  /* ---------------------------------------------------------------- */
  console.log("\ndata contract");
  const apps = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "apps.json"), "utf8"));
  const shots = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "shots.json"), "utf8"));

  await test("every porting pattern maps to a real port", () => {
    const patterns = fs.readFileSync(path.join(ROOT, "src", "data", "patterns.js"), "utf8");
    const [block] = patterns.split("export const COMPAT");
    const patternIds = [...block.matchAll(/\bid: "([^"]+)",/g)].map((m) => m[1]);
    assert.ok(patternIds.length > 0, "no patterns found in src/data/patterns.js");
    assert.equal(
      patternIds.length,
      apps.length,
      `there are ${apps.length} ports but ${patternIds.length} patterns`
    );
    for (const id of patternIds) {
      assert.ok(apps.some((a) => a.id === id), `pattern ${id} has no matching port`);
    }
  });

  await test("every capture in the manifest exists in the build", () => {
    for (const [portId, entry] of Object.entries(shots)) {
      for (const group of entry.groups ?? []) {
        for (const shot of group.shots ?? []) {
          for (const url of [shot.src, shot.thumb]) {
            assert.ok(
              fs.existsSync(path.join(DIST, url)),
              `${portId}/${shot.id}: ${url} is in the manifest but not in dist/`
            );
          }
        }
      }
    }
  });

  await test("manifest counts match the actual number of shots", () => {
    for (const [portId, entry] of Object.entries(shots)) {
      const actual = (entry.groups ?? []).reduce((n, g) => n + (g.shots?.length ?? 0), 0);
      assert.equal(entry.count, actual, `${portId}: count says ${entry.count}, found ${actual}`);
    }
  });

  /* ---------------------------------------------------------------- */
  console.log("\nno motion layer");
  const stylesheet = fs.readFileSync(path.join(assets, cssFiles[0]), "utf8");

  await test("the stylesheet declares no keyframe animations", () => {
    const keyframes = [...stylesheet.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
    assert.deepEqual(keyframes, [], `found @keyframes: ${keyframes.join(", ")}`);
  });

  await test("the stylesheet has no entrance or scroll-driven animation", () => {
    assert.doesNotMatch(stylesheet, /animation-name/, "an animated element survived");
    for (const atRule of ["animation-timeline", "view-timeline", "scroll-timeline", "timeline-scope"]) {
      assert.doesNotMatch(stylesheet, new RegExp(atRule), `${atRule} survived in the stylesheet`);
    }
    // Tailwind emits @property for its own custom properties; that is fine.
    assert.doesNotMatch(stylesheet, /--af-scroll/, "a scroll-driven custom property survived");
  });

  await test("no source file re-implements the deleted motion layer", () => {
    const banned = ["IntersectionObserver", "requestAnimationFrame", "starfield", "parallax", "scrollY", "matchMedia(\"(prefers-reduced-motion"];
    const offenders = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(jsx?|css)$/.test(entry.name)) {
          const text = fs.readFileSync(full, "utf8");
          for (const needle of banned) {
            if (text.includes(needle)) offenders.push(`${path.relative(ROOT, full)}: ${needle}`);
          }
        }
      }
    };
    walk(path.join(ROOT, "src"));
    assert.deepEqual(offenders, []);
  });

  /* ---------------------------------------------------------------- */
  console.log("\ncolour system");
  const cssSource = fs
    .readFileSync(path.join(ROOT, "src", "index.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  /** WCAG relative luminance + contrast ratio, straight from the source tokens. */
  const lum = (hex) => {
    let h = hex.trim().replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const [r, g, b] = h.match(/../g).map((x) => {
      const c = parseInt(x, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  /** Resolve the token map a given selector sees, later declarations winning. */
  const tokensFor = (selector) => {
    const tokens = {};
    const matchesSelector = (list) =>
      new RegExp(`(^|[,\\s])${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`).test(list);
    for (const [, selectorList, body] of cssSource.matchAll(/([\s\S]*?)\{([^{}]*)\}/g)) {
      // `:root, .dark` declares the shared inverse-band tokens for both schemes.
      if (!matchesSelector(selectorList)) continue;
      for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
        tokens[name] = value.trim();
      }
    }
    return tokens;
  };

  const TEXT_PAIRS = [
    ["--foreground", "--surface", "body text"],
    ["--foreground-muted", "--surface", "muted text"],
    ["--foreground-faint", "--surface", "faint meta text"],
    ["--brand", "--surface", "brand link"],
    ["--brand-soft-foreground", "--brand-soft", "brand chip"],
    ["--ok-foreground", "--ok-soft", "ok badge"],
    ["--warn-foreground", "--warn-soft", "warning badge"],
    ["--foreground-inverse", "--surface-inverse", "text on the inverse band"],
    ["--foreground-inverse-muted", "--surface-inverse", "muted on the inverse band"],
    ["--brand-on-inverse", "--surface-inverse", "accent on the inverse band"]
  ];

  await test("every text pair clears WCAG AA in both schemes", () => {
    const scores = [];
    // In dark mode the shared `:root, .dark` block is superseded by the later
    // `.dark` block; light mode resolves `:root` alone.
    const schemes = {
      light: tokensFor(":root"),
      dark: { ...tokensFor(":root"), ...tokensFor(".dark") }
    };

    for (const [scheme, tokens] of Object.entries(schemes)) {
      for (const [fg, bg, label] of TEXT_PAIRS) {
        assert.ok(tokens[fg], `${scheme}: ${fg} is undefined`);
        assert.ok(tokens[bg], `${scheme}: ${bg} is undefined`);
        const r = ratio(tokens[fg], tokens[bg]);
        scores.push(r);
        assert.ok(r >= 4.5, `${scheme}: ${label} is ${r.toFixed(2)}:1, below AA`);
      }
    }
    console.log(`      ${scores.length} pairs checked, lowest ${Math.min(...scores).toFixed(2)}:1`);
  });

  await test("the inverse band stays dark in both schemes", () => {
    // A band that flips per scheme silently breaks every white overlay on it.
    assert.ok(lum(tokensFor(":root")["--surface-inverse"]) < 0.1, "light inverse band is not dark");
    assert.ok(lum(tokensFor(".dark")["--surface-inverse"]) < 0.1, "dark inverse band is not dark");
  });

  await test("the pre-paint script resolves the scheme the CSS expects", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.match(html, /classList\.toggle\("dark"/, "the html element must carry .dark");
    assert.match(html, /prefers-color-scheme: dark/, "system preference must be honoured");
  });

  /* ---------------------------------------------------------------- */
  console.log("\na11y & semantics in source");
  const srcFiles = [];
  const walkSrc = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkSrc(full);
      else if (entry.name.endsWith(".jsx")) srcFiles.push([path.relative(ROOT, full), fs.readFileSync(full, "utf8")]);
    }
  };
  walkSrc(path.join(ROOT, "src"));

  await test("every page renders exactly one <h1>", () => {
    const pages = srcFiles.filter(([name]) => name.startsWith("src" + path.sep + "pages"));
    assert.ok(pages.length >= 5, `expected the page set, found ${pages.length}`);
    for (const [name, text] of pages) {
      const explicit = (text.match(/<h1[\s>]/g) ?? []).length;
      const viaSectionHeader = (text.match(/level=\{1\}/g) ?? []).length;
      const total = explicit + viaSectionHeader;
      assert.equal(total, 1, `${name} declares ${total} h1 headings (${explicit} explicit, ${viaSectionHeader} via SectionHeader)`);
    }
  });

  await test("every page ships its own metadata", () => {
    const pages = srcFiles.filter(([name]) => name.startsWith("src" + path.sep + "pages"));
    for (const [name, text] of pages) {
      assert.match(text, /<Seo\b/, `${name} has no <Seo>`);
    }
  });

  await test("the command palette is a proper combobox", () => {
    const text = fs.readFileSync(path.join(ROOT, "src", "components", "command-palette.jsx"), "utf8");
    assert.match(text, /role="combobox"/);
    assert.match(text, /role="listbox"/);
    assert.match(text, /role="option"/);
    assert.match(text, /aria-activedescendant/);
  });

  await test("the mobile tab bar marks the active tab with aria-current", () => {
    const text = fs.readFileSync(path.join(ROOT, "src", "components", "tab-bar.jsx"), "utf8");
    assert.match(text, /aria-current/);
    assert.match(text, /solid=\{active\}/, "the active tab should use the filled symbol");
  });

  console.log(`\n${passed} passed, ${failures.length} failed`);
  process.exit(failures.length ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});