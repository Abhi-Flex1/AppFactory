# AppFactory — Architecture (v2, Node.js)

Showcase website for global apps ported to HarmonyOS / OpenHarmony.
Express server + vanilla frontend. One dependency (`express`), no build step.

## Portfolio (source of truth: `data/apps.json`)

| App | What it is | Port pattern | Stack | Target | By | Status |
|---|---|---|---|---|---|---|
| **OpenGMaps** ([repo](https://github.com/Abhi-Flex1/OpenGMaps)) | Google Maps client | Flutter backport shim (`google_maps_flutter_ohos` over Maps JS API in ArkWeb) | Flutter 3.27.4-ohos, Dart, ArkWeb, Location Kit | OpenHarmony 5.0.1 · API 12 · `io.opengmaps.open_gmaps` | Abhi-Flex1 | Beta (needs API key) |
| **OpenTwit** ([repo](https://github.com/Abhi-Flex1/OpenTwit)) | Open X client | Native ArkTS Stage client over X API v2 (OAuth 2.0 PKCE) | ArkTS, HarmonyOS Symbols | HarmonyOS 6.1.1 · API 24 · `com.opentwit.harmony` | Abhi-Flex1 | Alpha |
| **OHEmacs** ([repo](https://github.com/Abhi-Flex1/OHEmacs)) | GNU Emacs 30.1 | Native ArkTS shell + NAPI bridge to C upstream | ArkTS, NAPI, XComponent, EGL, C | HarmonyOS 6.1.1 · API 24 · `com.example.ohemacs` | Abhi-Flex1 | Stage 1 ✓, Stage 2 WIP |
| **WhatIsIt** ([repo](https://github.com/BA4893/WhatIsIt)) | Native WhatsApp client | Companion-server bridge (ArkTS app ⇄ Go server ⇄ WA protocol) | ArkTS, Go (whatsmeow/meowcaller), WS | HarmonyOS (emulator-validated) | BA4893 | Beta, calls experimental |

Builders (`data/contributors.json`): [Abhi-Flex1](https://github.com/Abhi-Flex1) ([@Abhi_Flex](https://x.com/Abhi_Flex)) · [BA4893](https://github.com/BA4893) ([@LivingInHarmony](https://x.com/LivingInHarmony)).

## Site architecture

```
server.js               Express: static public/ + JSON API + SPA fallback (PORT env, default 3000)
data/apps.json          port dossiers (id, glyph, accent, stack, repo, maintainers[], install…)
data/contributors.json  builder credits (github, twitter, avatar, focus[])
public/index.html       bench hero / dossiers / builders / routes / developers / footer + sheet, JSON-LD
public/styles.css       token system: lab paper, slate ink, Harmony signal blue; Space Grotesk + Plex Sans/Mono
public/app.js           boot typing → bench select → dossiers/filter/sheet; fetch api/*, Lucide-guarded
```

- **API:** `GET /api/apps[?q=][?stack=]` · `GET /api/apps/:id` · `GET /api/contributors` · `GET /health` · JSON 404 for unknown `/api/*`.
- **Design (per Anthropic frontend-design skill + 2026 structural rules):** subject-grounded "bench log" — the page boots the ports in front of you (typed `hdc` log, status lamps, selectable devices). Cool lab paper (not cream), slate ink, Harmony signal blue; Space Grotesk display + Plex Sans body + Plex Mono for real data only. No scroll-reveals, no gradient meshes, no template chrome (no all-caps eyebrows, no `→` links, no middle-dot meta strings). Tokens as CSS vars, 4px spacing grid, fluid `clamp()` type, container queries for dossier rows.
- **Accessibility/SEO baseline:** skip link, landmarks, heading order, visible focus, AA contrast pairs, `prefers-reduced-motion` disables typing, lazy avatars with fixed dims, JSON-LD ItemList, `<noscript>` dossier list.
- **Filtering:** client-side full-text search + stack chips over the API payload.
- **Dialog:** highlights, porting notes, install `<pre>`, maintainer byline, disclaimer. `Esc`/backdrop close, `aria-modal`.

## Porting patterns documented on-site

1. **Native ArkTS shell** — Stage HAP + ArkUI + services; NAPI/XComponent for native code (WhatIsIt, OHEmacs shell).
2. **Backport shim** — keep stock plugin API, implement the OHOS platform interface (OpenGMaps).
3. **Companion server** — protocol lives on a small Go server, app stays thin + native (WhatIsIt server-go).

## Run / deploy

```sh
npm install && npm start   # http://localhost:3000
PORT=8080 npm start        # custom port
```

Deploy anywhere Node runs (VPS, Render, Fly, Docker). No static-export step; `GET /health` is the probe.

## Roadmap

- Screenshots per dossier, `.hap` release links, per-app deep links (`/?app=id`)
- i18n (EN/中文), RSS for new ports, tablet/foldable/watch/TV badges per port
