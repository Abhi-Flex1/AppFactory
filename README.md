# AppFactory

Showcase for global apps ported to OpenHarmony and HarmonyOS: **OpenGMaps** (Flutter Maps), **OHEmacs** (GNU Emacs 30.1), **WhatIsIt** (native WhatsApp client).

Node.js + Express site with a JSON API — one dependency, no build step:

```sh
npm install
npm start        # → http://localhost:3000
npm run dev      # auto-reload via node --watch
```

- Frontend: `public/` — pure HTML5/CSS3/ES6 with dedicated multi-page routes:
  - `/`: Flagship showcase with interactive device stage
  - `/apps`: Full ports catalog with live search and tech filters
  - `/apps/:id`: Dedicated project pages (`/apps/opengmaps`, `/apps/ohemacs`, `/apps/whatisit`) with live GitHub Release downloads, interactive previews, architecture seams, and installation guides
  - `/architecture`: Engineering white paper detailing the three porting patterns
  - `/builders`: Core engineering team profiles and maintained ports roster
- Data: `data/apps.json` (ports), `data/releases.json` (cached GitHub releases), `data/contributors.json` (builder credits)
- Server: `server.js` — static host + `GET /api/apps` + `GET /api/apps/:id` + `GET /api/releases` + `GET /api/releases/:id` + `GET /api/contributors` + `GET /health`
- Architecture: see [`ARCHITECTURE.md`](ARCHITECTURE.md)

## Builders

- **[Abhi-Flex1](https://github.com/Abhi-Flex1)** ([@Abhi_Flex](https://x.com/Abhi_Flex)) — founder, OpenGMaps & OHEmacs
- **[BA4893](https://github.com/BA4893)** ([@LivingInHarmony](https://x.com/LivingInHarmony)) — WhatIsIt

## Add a port

Append one object to `data/apps.json` (and a builder to `data/contributors.json` if new), restart, open a PR. Apache-2.0 — each port lists its own upstream license/attribution.
