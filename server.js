// AppFactory server — JSON API + static host for the built React frontend.
//   npm run build && npm start   →  http://localhost:3000
//   npm run dev                  →  Vite on :5173 proxying /api here
//
// Only the API needs a server. Everything the page renders comes from /api/*,
// so the same build works behind any static host plus a handful of routes.
const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DIST_DIR = path.join(ROOT, "dist");
const PUBLIC_DIR = path.join(ROOT, "public");

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  } catch {
    return fallback;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${parseFloat((bytes / 1024 ** i).toFixed(1))} ${units[i]}`;
}

/* ------------------------------------------------------------------ *
 * GitHub Releases — live, cached, with an offline fallback.
 * ------------------------------------------------------------------ */

const REPO_MAP = {
  "reel-edit": "Abhi-Flex1/Reel-Edit",
  opengmaps: "Abhi-Flex1/OpenGMaps",
  opentwit: "Abhi-Flex1/OpenTwit",
  "opentwit-web": "Abhi-Flex1/OpenTwit-Web",
  ohemacs: "Abhi-Flex1/OHEmacs",
  whatisit: "BA4893/WhatIsIt"
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const releaseCache = new Map();

function labelAsset(name) {
  if (name.endsWith(".hap")) return { label: "OpenHarmony HAP package", type: "hap" };
  if (name.endsWith(".app")) return { label: "HarmonyOS app bundle", type: "hap" };
  if (name.endsWith(".zip")) return { label: "Bundle package", type: "bundle" };
  return { label: "Native asset", type: "binary" };
}

async function getReleaseData(appId) {
  const cached = releaseCache.get(appId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) return cached.data;

  const fallback = readJSON("releases.json", {})[appId] ?? null;
  const repoSlug = REPO_MAP[appId];
  if (!repoSlug) return fallback;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.github.com/repos/${repoSlug}/releases`, {
      headers: { "User-Agent": "AppFactory-Showcase-Server", Accept: "application/vnd.github.v3+json" },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const releases = await res.json();
      if (Array.isArray(releases) && releases.length) {
        const latest = releases[0];
        const assets = (latest.assets ?? []).map((asset) => {
          const { label, type } = labelAsset(asset.name);
          return {
            name: asset.name,
            label,
            type,
            size: asset.size,
            formattedSize: formatBytes(asset.size),
            downloadCount: asset.download_count,
            downloadUrl: asset.browser_download_url,
            installHint: type === "hap" ? `hdc install ${asset.name}` : ""
          };
        });

        if (latest.zipball_url) {
          assets.push({
            name: `Source code (${latest.tag_name})`,
            label: "Source code archive",
            type: "archive",
            size: 0,
            formattedSize: "ZIP",
            downloadCount: 0,
            downloadUrl: `https://github.com/${repoSlug}/archive/refs/tags/${latest.tag_name}.zip`,
            installHint: `git clone https://github.com/${repoSlug}.git`
          });
        }

        const data = {
          repo: `https://github.com/${repoSlug}`,
          hasRelease: true,
          tagName: latest.tag_name,
          name: latest.name || latest.tag_name,
          publishedAt: latest.published_at,
          htmlUrl: latest.html_url,
          body: latest.body || "",
          assets
        };
        releaseCache.set(appId, { timestamp: now, data });
        return data;
      }
    }
  } catch {
    // Offline, rate-limited or slow — the recorded fallback is the honest answer.
  }

  if (fallback) releaseCache.set(appId, { timestamp: now, data: fallback });
  return fallback;
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    app: "appfactory",
    pages: ["/", "/ports", "/ports/:id", "/architecture", "/builders"],
    ports: Object.keys(REPO_MAP).length
  });
});

app.get("/api/contributors", (req, res) => res.json(readJSON("contributors.json", [])));

app.get("/api/shots", (req, res) => res.json(readJSON("shots.json", {})));

app.get("/api/shots/:id", (req, res) => {
  const found = readJSON("shots.json", {})[req.params.id];
  if (!found) return res.status(404).json({ error: "no screenshots for that port" });
  res.json(found);
});

app.get("/api/apps", (req, res) => {
  let apps = readJSON("apps.json", []);
  const { q, stack } = req.query;

  if (stack) {
    const wanted = String(stack).toLowerCase();
    apps = apps.filter((app) =>
      [...(app.stack ?? []), ...(app.filterTags ?? [])].some(
        (tag) => tag.toLowerCase() === wanted
      )
    );
  }

  if (q) {
    const terms = String(q).toLowerCase().split(/\s+/).filter(Boolean);
    apps = apps.filter((app) => {
      const hay = [
        app.name,
        app.tagline,
        app.category,
        app.description,
        app.api,
        app.bundle,
        (app.stack ?? []).join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }

  res.json(apps);
});

app.get("/api/apps/:id", (req, res) => {
  const found = readJSON("apps.json", []).find((app) => app.id === req.params.id);
  if (!found) return res.status(404).json({ error: "app not found" });
  res.json(found);
});

app.get("/api/releases", async (req, res) => {
  const ids = Object.keys(REPO_MAP);
  const entries = await Promise.all(ids.map(async (id) => [id, await getReleaseData(id)]));
  res.json(Object.fromEntries(entries));
});

app.get("/api/releases/:id", async (req, res) => {
  const data = await getReleaseData(req.params.id);
  if (!data) return res.status(404).json({ error: "release data not found" });
  res.json(data);
});

app.use("/api", (req, res) => res.status(404).json({ error: "unknown api route" }));

/* ------------------------------------------------------------------ *
 * Static frontend
 * ------------------------------------------------------------------ */

// Hashed build output first (immutable), then public/shots (Vite copies these in).
app.use(
  "/assets",
  express.static(path.join(DIST_DIR, "assets"), { immutable: true, maxAge: "1y" })
);

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false, maxAge: "1h" }));
} else {
  app.use(express.static(PUBLIC_DIR, { index: false }));
}

app.get(/^\/(?!api|health).*/, (req, res) => {
  const index = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(index)) {
    return res
      .status(503)
      .type("text/plain")
      .send("dist/ not found — run `npm run build` first, or use `npm run dev` for the Vite dev server.");
  }
  // The shell names the hashed chunks, so it must always be revalidated —
  // otherwise a cached index.html points at a chunk that no longer exists.
  res.set("Cache-Control", "no-cache");
  res.sendFile(index);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`AppFactory listening on http://localhost:${PORT}`));
}

module.exports = app;