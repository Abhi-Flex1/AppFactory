# AppFactory

Showcase for global apps ported to OpenHarmony and HarmonyOS, built in the
HarmonyOS design language: system blue on neutral surfaces, capsule controls,
filled system symbols, and a mobile tab bar that becomes a top navigation bar
on wide screens.

**Live:** https://appfactoryhos.vercel.app

## The ports

| Port | What it is | Pattern | Target | Maintainer |
|---|---|---|---|---|
| **OpenGMaps SDK** ([repo](https://github.com/Abhi-Flex1/OpenGMaps)) | Google Maps SDK for OpenHarmony & HarmonyOS | Flutter backport shim over ArkWeb | OpenHarmony 5.0.1 · API 12 | Abhi-Flex1 |
| **OpenTwit** ([repo](https://github.com/Abhi-Flex1/OpenTwit)) | Open X client in native ArkTS | Native ArkTS app over X API v2 | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 |
| **OpenTwit Web** ([repo](https://github.com/Abhi-Flex1/OpenTwit-Web)) | x.com in a native HarmonyOS shell | Native web shell (system Web + ArkUI chrome) | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 |
| **OHEmacs** ([repo](https://github.com/Abhi-Flex1/OHEmacs)) | GNU Emacs 30.1 | ArkTS shell + NAPI bridge to C | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 |
| **WhatIsIt** ([repo](https://github.com/BA4893/WhatIsIt)) | Native WhatsApp client | Go companion server + thin ArkTS client | HarmonyOS (emulator-validated) | BA4893 |

## Run it

Node.js + Express with a JSON API — one dependency, no build step:

```sh
npm install
npm start        # → http://localhost:3000
npm run dev      # auto-reload via node --watch
```

- Frontend: `public/` — HTML5/CSS3/ES6, no framework, multi-page routes:
  - `/`: product hero, interactive device stage for every port, catalogue, porting patterns, compatibility matrix, builders, developer quickstart
  - `/apps`: full catalogue with live search, stack filters and release tags
  - `/apps/:id`: project pages (`/apps/opengmaps`, `/apps/opentwit`, `/apps/opentwit-web`, `/apps/ohemacs`, `/apps/whatisit`) with live GitHub release assets, an interactive preview, architecture notes and install guides
  - `/architecture`: the five porting patterns with call paths, trade-offs and the compatibility record
  - `/builders`: maintainer profiles and the ports each one looks after
- Data: `data/apps.json` (ports), `data/releases.json` (offline release fallback), `data/contributors.json` (builder credits)
- Screenshots: `data/shots.json` — real device captures pulled out of each port repository by `npm run shots` (see below), served from `public/shots/`
- Server: `server.js` — static host + `GET /api/apps` + `GET /api/apps/:id` + `GET /api/releases` + `GET /api/releases/:id` + `GET /api/shots` + `GET /api/shots/:id` + `GET /api/contributors` + `GET /health`
- Shared frontend helpers: `public/site.js` (app icons, device screens, porting patterns, compatibility record, toast/clipboard, nav wiring)
- Design + API notes: [`ARCHITECTURE.md`](ARCHITECTURE.md)

## Screenshots

Every image on the site is a real capture taken from the port's own repository —
no mockups. `scripts/fetch-shots.py` downloads the curated set listed in
`scripts/shots.sources.json` from `raw.githubusercontent.com`, resizes each one
into a viewer image plus a thumbnail under `public/shots/<port>/`, and rewrites
`data/shots.json`, which `/api/shots` serves to the pages.

```sh
npm run shots                      # refresh everything (needs Pillow)
npm run shots -- opentwit-web      # one port
npm run shots -- --refresh         # ignore the download cache
```

Ports that have not committed captures yet (currently OpenGMaps and WhatIsIt)
fall back to an interface model drawn from the app's layout, labelled as such —
add screenshots to the repository, add them to `scripts/shots.sources.json`, and
re-run `npm run shots` to replace the model with the real thing.

## Builders

- **[Abhi-Flex1](https://github.com/Abhi-Flex1)** ([@Abhi_Flex](https://x.com/Abhi_Flex)) — OpenGMaps, OpenTwit, OpenTwit Web, OHEmacs, AppFactory
- **[BA4893](https://github.com/BA4893)** ([@LivingInHarmony](https://x.com/LivingInHarmony)) — WhatIsIt

## Add a port

Append one object to `data/apps.json` (and a builder to `data/contributors.json`
if new), add the repo to `REPO_MAP` in `server.js` if it publishes releases,
restart, open a PR. Apache-2.0 — each port lists its own upstream
license/attribution.
