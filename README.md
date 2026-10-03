# AppFactory

A working record of global apps ported to **OpenHarmony** and **HarmonyOS**, and
of what each porting seam actually cost. Every screenshot is a real capture
committed to the port's own repository, and every status line says what was
verified on a device versus what was not.

**Live:** https://appfactoryhos.vercel.app

## The ports

| Port | What it is | Porting seam | Target | By | State |
|---|---|---|---|---|---|
| [**Reel-Edit**](https://github.com/Abhi-Flex1/Reel-Edit) | [OpenReel Video](https://github.com/Augani/openreel-video) (5.2k★) video editor for HarmonyOS PC | Upstream web host + native encoder | HarmonyOS 6.1.1 · API 24 · 2in1 | Abhi-Flex1 | Beta |
| [**OpenGMaps SDK**](https://github.com/Abhi-Flex1/OpenGMaps) | Google Maps SDK for OpenHarmony & HarmonyOS | Flutter backport shim | OpenHarmony 5.0.1 · API 12 | Abhi-Flex1 | Beta |
| [**OpenTwit**](https://github.com/Abhi-Flex1/OpenTwit) | Open X client in native ArkTS | Native ArkTS app | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 | Alpha |
| [**OpenTwit Web**](https://github.com/Abhi-Flex1/OpenTwit-Web) | x.com in a native HarmonyOS shell | Native web shell | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 | 1.0.0 |
| [**OHEmacs**](https://github.com/Abhi-Flex1/OHEmacs) | GNU Emacs 30.1 | ArkTS shell + NAPI bridge to C | HarmonyOS 6.1.1 · API 24 | Abhi-Flex1 | Stage 1 |
| [**WhatIsIt**](https://github.com/BA4893/WhatIsIt) | Native WhatsApp client | Companion Go server | HarmonyOS (emulator) | BA4893 | Beta |

## Run it

```sh
npm install
npm run dev      # Vite on :5173, /api proxied to Express on :3000
```

In production Express serves the built SPA and the API together:

```sh
npm run build && npm start        # → http://localhost:3000
```

## How it is put together

```
index.html              Vite entry — theme resolved pre-paint, noscript port list
vite.config.mjs         React + Tailwind v4, manual vendor chunks
server.js               Express: JSON API + static host for dist/
src/
  index.css             the whole design system: HarmonyOS tokens, then components
  App.jsx               routes, ⌘K wiring, skip link, mobile search affordance
  components/           shell (header, tab bar, footer), port card, shot gallery,
                        command palette, and the HarmonyOS symbol set
  components/ui/        button, card, badge, tabs, dialog, input, separator
  pages/                home, ports, port detail, architecture, builders, 404
  lib/                  API client, data hooks, cn(), formatting
  data/                 porting patterns, compatibility record, navigation
data/                   apps.json, contributors.json, releases.json, shots.json
public/shots/           real captures pulled from each port repository
```

**Stack.** React 19, Tailwind v4, Vite, and shadcn-style components written by
hand in `src/components/ui/` — `class-variance-authority` for variants,
`clsx` + `tailwind-merge` for class composition. Radix was used first and then
removed: the dialog is now a native `<dialog>`, tabs and separators are ~40
lines of ARIA, and `asChild` is a `cloneElement`. That cut 18 kB gzip.

**Routing** is [wouter](https://github.com/molefrog/wouter) — 1.6 kB — not
React Router. Page metadata is React 19's hoisted `<title>` / `<meta>` /
`<link>`, so `<Seo>` costs one component and no effects.

**Design.** HarmonyOS: system blue `#0A59F7` on a neutral surface ladder,
the HarmonyOS radius scale (8/12/16/20/24), capsule buttons in the
filled / tonal / outline / text hierarchy, filled system symbols, a top
navigation bar that becomes a bottom tab bar below `lg`. Full light and dark
schemes, with the scheme resolved by an inline script so there is no flash.

**No motion layer.** There are no entrance animations, no scroll reveals, no
parallax and no starfield boot sequence — the previous site had all of them and
they cost about 15 kB plus a 420 vh scroll spacer. The only transitions are
120 ms colour changes on hover, focus and press. `scripts/build-test.js` fails
the build if a `@keyframes`, `animation-timeline` or `IntersectionObserver`
reappears.

## API

```
GET /api/apps[?q=][?stack=]     GET /api/apps/:id
GET /api/shots                 GET /api/shots/:id
GET /api/contributors          GET /api/releases[/:id]
GET /health
```

Everything the page renders comes from here, so the data is readable without
running any JavaScript.

## Screenshots

No mockups. `scripts/fetch-shots.py` downloads the curated set listed in
`scripts/shots.sources.json` from `raw.githubusercontent.com`, resizes each into a
viewer image plus a thumbnail under `public/shots/<port>/`, and rewrites
`data/shots.json` — 25 captures across the catalogue today.

```sh
npm run shots                      # refresh everything (needs Pillow)
npm run shots -- reel-edit         # one port
npm run shots -- --refresh         # ignore the download cache
```

Ports that have not committed captures yet (OpenGMaps, WhatIsIt) say so on their
page instead of showing an invented interface.

## Tests

```sh
npm test          # both suites
npm run test:api  # 21 API contract checks against a real server
npm run test:build # 21 build checks: payloads, motion, colour contrast, semantics
```

`test:api` boots the server on an ephemeral port and checks every route, the
search and filter parameters, that every maintainer resolves to a builder, and
that every capture named in the manifest is actually served as an image.

`test:build` inspects the real output: hashed filenames, payload budgets, no
`@keyframes`, every text/background token pair above WCAG AA **in both
schemes**, one `<h1>` per page, and that the palette keeps its combobox ARIA.

## Add a port

Append one object to `data/apps.json` (and a builder to
`data/contributors.json` if new), add the repository to `REPO_MAP` in
`server.js` if it publishes releases, add its screenshots to
`scripts/shots.sources.json`, and run `npm run shots`. The catalogue, the
compatibility record, the footer and the sitemap are all generated — add the
route to `sitemap.xml` too. Apache-2.0; each port carries its own upstream
licence and attribution.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the design-system detail.