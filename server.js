// AppFactory — single-process host: the JSON API plus the built frontend.
//
//   npm run build && npm start   →  http://localhost:3000
//   npm run dev                  →  Vite on :5173 proxying /api here
//
// This exists for local development and for deploying the whole thing to a VPS
// or anywhere Node runs. On Vercel the API is split out into api/[[...path]].js
// and this file is not deployed, so the client build is served as static output
// and never passes through a serverless bundler.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import api from "./api/routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
// ESM has no __dirname; derive it from this module's own URL.
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT, "dist");
const PUBLIC_DIR = path.join(ROOT, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(api);

/* ------------------------------------------------------------------ *
 * Static frontend
 * ------------------------------------------------------------------ */

// Hashed build output first (immutable), then public/shots (Vite copies these in).
app.use("/assets", express.static(path.join(DIST_DIR, "assets"), { immutable: true, maxAge: "1y" }));

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

// Only listen when run directly, so tests can import the app.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  app.listen(PORT, () => console.log(`AppFactory listening on http://localhost:${PORT}`));
}

export default app;