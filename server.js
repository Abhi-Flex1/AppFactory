// AppFactory server — Express multi-page host + JSON API with GitHub release integration.
//   npm install && npm start  →  http://localhost:3000
const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const PUBLIC_DIR = path.join(__dirname, "public");

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  } catch {
    return fallback;
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// GitHub Releases Cache & Fetcher
const REPO_MAP = {
  opengmaps: "Abhi-Flex1/OpenGMaps",
  ohemacs: "Abhi-Flex1/OHEmacs",
  whatisit: "BA4893/WhatIsIt",
  opentwit: "Abhi-Flex1/OpenTwit"
};

const releaseCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getReleaseData(appId) {
  const cached = releaseCache.get(appId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fallbackAll = readJSON("releases.json", {});
  const fallbackData = fallbackAll[appId] || null;
  const repoSlug = REPO_MAP[appId];

  if (!repoSlug) {
    return fallbackData;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.github.com/repos/${repoSlug}/releases`, {
      headers: {
        "User-Agent": "AppFactory-Showcase-Server",
        Accept: "application/vnd.github.v3+json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const releases = await res.json();
      if (Array.isArray(releases) && releases.length > 0) {
        const latest = releases[0];
        const formatted = {
          repo: `https://github.com/${repoSlug}`,
          hasRelease: true,
          tagName: latest.tag_name,
          name: latest.name || latest.tag_name,
          publishedAt: latest.published_at,
          htmlUrl: latest.html_url,
          body: latest.body || "",
          assets: (latest.assets || []).map((asset) => {
            const isHap = asset.name.endsWith(".hap");
            const isZip = asset.name.endsWith(".zip");
            return {
              name: asset.name,
              label: isHap ? "OpenHarmony HAP Package" : (isZip ? "Bundle Package" : "Native Asset"),
              type: isHap ? "hap" : (isZip ? "bundle" : "binary"),
              size: asset.size,
              formattedSize: formatBytes(asset.size),
              downloadCount: asset.download_count,
              downloadUrl: asset.browser_download_url,
              installHint: isHap ? `hdc install ${asset.name}` : ""
            };
          })
        };

        if (latest.zipball_url) {
          formatted.assets.push({
            name: "Source Code (zip)",
            label: "Source Code Archive",
            type: "archive",
            size: 0,
            formattedSize: "ZIP",
            downloadCount: 0,
            downloadUrl: `https://github.com/${repoSlug}/archive/refs/tags/${latest.tag_name}.zip`,
            installHint: `git clone https://github.com/${repoSlug}.git`
          });
        }

        releaseCache.set(appId, { timestamp: now, data: formatted });
        return formatted;
      }
    }
  } catch (err) {
    // Network or rate-limit error, use fallback
  }

  if (fallbackData) {
    releaseCache.set(appId, { timestamp: now, data: fallbackData });
    return fallbackData;
  }
  return null;
}

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Health Probe
app.get("/health", (req, res) => res.json({ ok: true, app: "appfactory", pages: ["/", "/apps", "/architecture", "/builders"] }));

// REST APIs
app.get("/api/contributors", (req, res) => {
  res.json(readJSON("contributors.json", []));
});

app.get("/api/apps", (req, res) => {
  let apps = readJSON("apps.json", []);
  const { q, stack } = req.query;
  if (stack) {
    const s = String(stack).toLowerCase();
    apps = apps.filter((a) =>
      [...(a.stack || []), ...(a.filterTags || [])].some((t) => t.toLowerCase() === s)
    );
  }
  if (q) {
    const terms = String(q).toLowerCase().split(/\s+/);
    apps = apps.filter((a) => {
      const hay = [a.name, a.tagline, a.category, a.description, (a.stack || []).join(" "), a.api, a.bundle]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  res.json(apps);
});

app.get("/api/apps/:id", (req, res) => {
  const apps = readJSON("apps.json", []);
  const found = apps.find((a) => a.id === req.params.id);
  if (!found) return res.status(404).json({ error: "app not found" });
  res.json(found);
});

app.get("/api/releases", async (req, res) => {
  const keys = Object.keys(REPO_MAP);
  const results = {};
  await Promise.all(
    keys.map(async (key) => {
      results[key] = await getReleaseData(key);
    })
  );
  res.json(results);
});

app.get("/api/releases/:id", async (req, res) => {
  const data = await getReleaseData(req.params.id);
  if (!data) return res.status(404).json({ error: "release data not found" });
  res.json(data);
});

app.use("/api", (req, res) => res.status(404).json({ error: "unknown api route" }));

// Multi-Page Routes
app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));
app.get("/apps", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "apps.html")));
app.get("/apps/:id", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "project.html")));
app.get("/architecture", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "architecture.html")));
app.get("/builders", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "builders.html")));

// Catch-all fallback
app.get("*", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, () => console.log(`AppFactory listening on http://localhost:${PORT}`));

