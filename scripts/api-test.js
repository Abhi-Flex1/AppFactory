// API contract tests. Starts the real server on an ephemeral port and checks
// every route the frontend depends on.
//   node scripts/api-test.js
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const PORT = 3000 + Math.floor(Math.random() * 900);
const BASE = `http://127.0.0.1:${PORT}`;

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

async function get(pathname) {
  const res = await fetch(BASE + pathname);
  const body = await res.json();
  return { status: res.status, body };
}

async function waitForServer(attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("server never became healthy");
}

const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore"
});

(async () => {
  try {
    await waitForServer();
    console.log(`\nAppFactory API contract — ${BASE}\n`);

    /* ---------------------------------------------------------------- */
    console.log("health");
    await test("GET /health reports ok and the route list", async () => {
      const { status, body } = await get("/health");
      assert.equal(status, 200);
      assert.equal(body.ok, true);
      assert.ok(Array.isArray(body.pages));
    });

    /* ---------------------------------------------------------------- */
    console.log("\n/catalogue");
    let apps = [];
    await test("GET /api/apps returns every port", async () => {
      const { status, body } = await get("/api/apps");
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
      assert.ok(body.length >= 6, `expected at least 6 ports, got ${body.length}`);
      apps = body;
    });

    await test("every port has the fields the UI reads", async () => {
      for (const app of apps) {
        for (const field of [
          "id", "glyph", "accent", "accentDeep", "name", "tagline", "category",
          "status", "statusTone", "stack", "repo", "maintainers", "api",
          "license", "description", "features", "porting", "install"
        ]) {
          assert.ok(app[field] !== undefined, `${app.id} is missing ${field}`);
        }
        assert.ok(Array.isArray(app.features) && app.features.length, `${app.id} has no features`);
        assert.ok(Array.isArray(app.porting) && app.porting.length, `${app.id} has no porting notes`);
        assert.ok(Array.isArray(app.stack) && app.stack.length, `${app.id} has no stack`);
        assert.match(app.accent, /^#[0-9a-f]{6}$/i, `${app.id} accent is not a hex colour`);
      }
    });

    await test("port ids are unique and URL-safe", async () => {
      const ids = apps.map((a) => a.id);
      assert.equal(new Set(ids).size, ids.length, "duplicate port id");
      for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `${id} is not URL-safe`);
    });

    await test("Reel-Edit is listed with its upstream and host details", async () => {
      const reel = apps.find((a) => a.id === "reel-edit");
      assert.ok(reel, "reel-edit is missing from the catalogue");
      assert.equal(reel.repo, "https://github.com/Abhi-Flex1/Reel-Edit");
      assert.equal(reel.upstream, "https://github.com/Augani/openreel-video");
      assert.equal(reel.bundle, "com.reeledit.harmony");
      assert.ok(reel.stack.includes("ArkWeb"));
      assert.ok(reel.maintainers.includes("abhi-flex1"));
      assert.match(reel.license, /MIT/);
    });

    await test("GET /api/apps/:id returns one port", async () => {
      const { status, body } = await get("/api/apps/reel-edit");
      assert.equal(status, 200);
      assert.equal(body.id, "reel-edit");
      assert.equal(body.name, "Reel-Edit");
    });

    await test("GET /api/apps/:id 404s for an unknown port", async () => {
      const { status, body } = await get("/api/apps/nope");
      assert.equal(status, 404);
      assert.ok(body.error);
    });

    await test("GET /api/apps?q= filters", async () => {
      const { body } = await get("/api/apps?q=emacs");
      assert.equal(body.length, 1);
      assert.equal(body[0].id, "ohemacs");
    });

    await test("GET /api/apps?stack= filters", async () => {
      const { body } = await get("/api/apps?stack=Go");
      assert.equal(body.length, 1);
      assert.equal(body[0].id, "whatisit");
    });

    await test("GET /api/apps with no match returns an empty array", async () => {
      const { status, body } = await get("/api/apps?q=zzzzznotathing");
      assert.equal(status, 200);
      assert.deepEqual(body, []);
    });

    /* ---------------------------------------------------------------- */
    console.log("\n/screenshots");
    await test("GET /api/shots returns a manifest per port", async () => {
      const { status, body } = await get("/api/shots");
      assert.equal(status, 200);
      assert.ok(body["reel-edit"], "reel-edit has no screenshot manifest");
      assert.equal(body["reel-edit"].count, 3);
    });

    await test("every capture points at a file that exists", async () => {
      const { body } = await get("/api/shots");
      let checked = 0;
      for (const [portId, entry] of Object.entries(body)) {
        for (const group of entry.groups ?? []) {
          for (const shot of group.shots ?? []) {
            for (const url of [shot.src, shot.thumb]) {
              const res = await fetch(BASE + url);
              assert.equal(res.status, 200, `${portId}/${shot.id}: ${url} → ${res.status}`);
              assert.ok(
                res.headers.get("content-type")?.startsWith("image/"),
                `${url} is not an image`
              );
              checked++;
            }
            assert.ok(shot.width > 0 && shot.height > 0, `${shot.id} has no dimensions`);
            assert.ok(shot.source?.startsWith("https://github.com/"), `${shot.id} has no source link`);
          }
        }
      }
      assert.ok(checked >= 40, `expected 40+ image files, checked ${checked}`);
    });

    await test("GET /api/shots/:id returns one port's captures", async () => {
      const { status, body } = await get("/api/shots/reel-edit");
      assert.equal(status, 200);
      assert.equal(body.repo, "Abhi-Flex1/Reel-Edit");
      assert.ok(body.groups[0].shots.length >= 3);
    });

    await test("GET /api/shots/:id 404s for a port with no captures", async () => {
      const { status } = await get("/api/shots/does-not-exist");
      assert.equal(status, 404);
    });

    /* ---------------------------------------------------------------- */
    console.log("\n/builders");
    await test("GET /api/contributors returns builders", async () => {
      const { status, body } = await get("/api/contributors");
      assert.equal(status, 200);
      assert.ok(body.length >= 2);
      for (const person of body) {
        assert.ok(person.id && person.name && person.role);
        assert.ok(Array.isArray(person.focus) && person.focus.length);
      }
    });

    await test("every port's maintainers resolve to a builder", async () => {
      const { body: people } = await get("/api/contributors");
      const ids = new Set(people.map((p) => p.id));
      for (const app of apps) {
        for (const maintainer of app.maintainers) {
          assert.ok(ids.has(maintainer), `${app.id} names unknown maintainer ${maintainer}`);
        }
      }
    });

    /* ---------------------------------------------------------------- */
    console.log("\n/releases");
    await test("GET /api/releases/:id answers or 404s, never hangs", async () => {
      const { status, body } = await get("/api/releases/reel-edit");
      assert.ok(status === 200 || status === 404, `unexpected status ${status}`);
      if (status === 200) {
        assert.equal(body.repo, "https://github.com/Abhi-Flex1/Reel-Edit");
        if (body.hasRelease) {
          assert.ok(body.tagName, "a release without a tag name");
          for (const asset of body.assets ?? []) {
            assert.ok(asset.name && asset.downloadUrl, "asset missing name or url");
            assert.ok(["hap", "bundle", "binary", "archive"].includes(asset.type), `bad asset type ${asset.type}`);
          }
        }
      }
    });

    await test("GET /api/releases returns one entry per port", async () => {
      const { status, body } = await get("/api/releases");
      assert.equal(status, 200);
      for (const app of apps) assert.ok(app.id in body, `no release entry for ${app.id}`);
    });

    /* ---------------------------------------------------------------- */
    console.log("\n/static");
    await test("unknown /api routes 404 as JSON", async () => {
      const { status, body } = await get("/api/nope");
      assert.equal(status, 404);
      assert.ok(body.error);
    });

    await test("SPA routes fall through to the built index.html", async () => {
      for (const route of ["/", "/ports", "/ports/reel-edit", "/architecture", "/builders"]) {
        const res = await fetch(BASE + route);
        assert.equal(res.status, 200, `${route} → ${res.status}`);
        const html = await res.text();
        assert.match(html, /<div id="root">/, `${route} did not serve the app shell`);
      }
    });

    await test("the shell references a hashed bundle and the API", async () => {
      const html = await (await fetch(BASE + "/")).text();
      assert.match(html, /<script type="module"[^>]*src="\/assets\/index-[^"]+\.js"/);
      assert.match(html, /rel="icon"/);
    });
  } finally {
    server.kill();
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  process.exit(failures.length ? 1 : 0);
})().catch((error) => {
  server.kill();
  console.error(error);
  process.exit(1);
});