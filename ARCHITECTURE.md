# AppFactory — architecture

Showcase site for global apps ported to OpenHarmony and HarmonyOS. A React SPA
in front of a small Express JSON API. Nine runtime dependencies, one build step.

## Portfolio (source of truth: `data/apps.json`)

| App | Porting seam | Stack | Target | By | State |
|---|---|---|---|---|---|
| **Reel-Edit** | Upstream web host — ArkWeb serves the unmodified upstream bundle over a virtual `https://` origin; native H.264/AAC + MP4 muxer replaces the desktop FFmpeg sidecar | ArkTS, ArkWeb, React, TypeScript, NAPI | HarmonyOS 6.1.1 · API 24 · `com.reeledit.harmony` | Abhi-Flex1 | Beta |
| **OpenGMaps SDK** | Flutter backport shim — stock `google_maps_flutter` Dart API, OHOS platform interface behind it | Flutter, ArkTS, ArkWeb, Location Kit | OpenHarmony 5.0.1 · API 12 · `io.opengmaps.open_gmaps` | Abhi-Flex1 | Beta |
| **OpenTwit** | Native ArkTS client over the vendor API | ArkTS, HarmonyOS Symbols | HarmonyOS 6.1.1 · API 24 · `com.opentwit.harmony` | Abhi-Flex1 | Alpha |
| **OpenTwit Web** | Native web shell — system Web component plus native ArkUI chrome, injected CSS/JS strips the site's own | ArkTS, ArkWeb | HarmonyOS 6.1.1 · API 24 · `com.opentwit.web` | Abhi-Flex1 | 1.0.0 |
| **OHEmacs** | ArkTS shell + NAPI bridge to the C upstream | ArkTS, NAPI, XComponent, EGL, C | HarmonyOS 6.1.1 · API 24 · `com.example.ohemacs` | Abhi-Flex1 | Stage 1 |
| **WhatIsIt** | Companion server — ArkTS client ⇄ Go daemon ⇄ messaging protocol | ArkTS, Go, WebSocket | HarmonyOS (emulator) · BA4893 | Beta | |

The six seams and their trade-offs live in `src/data/patterns.js`, next to the
compatibility record in the same file. One pattern per port, because each port
chose a seam and the seam is the thing worth teaching.

## Why Reel-Edit is its own seam

It is not "port 5b of the web shell". OpenTwit Web wraps a web app it does not
control and rebuilds the chrome around it. Reel-Edit hosts a **complete
application** — timeline, engine, panels, export pipeline, 863 upstream tests —
and supplies the platform layer the browser had been providing for free:

- ArkWeb serves the upstream bundle over a virtual `https://openreel.harmony.local`
  origin, because ArkWeb blocks cross-origin sub-resource loads from `file://`
  and `resource://`.
- `window.openreel` is reimplemented in ArkTS and registered **synchronous** —
  the async JS proxy does not marshal a returned `Promise`, so the request is
  handed off and the reply arrives through `window.__openreelResolve(id, payload)`.
- `reel_export.c` replaces the FFmpeg sidecar with `OH_VideoEncoder` (H.264),
  `OH_AudioEncoder` (AAC) and `OH_AVMuxer` (MP4), reproducing its frame-credit
  backpressure so the renderer's throttling loop is unchanged.
- Binary payloads cross the JSON proxy as base64; `createWebMessagePorts` +
  `postMessage` succeeds natively but never reaches the page.

Three upstream behaviours changed, and only three: no in-app window controls,
device-driven theme blocks, and `OPENREEL_HARMONY=1` removing the WebCodecs
export path that would bypass the native encoder.

## Rendering

| Route | Page |
|---|---|
| `/` | Hero, the six ports, the six seams, the compatibility record, the capture wall, builders, quickstart |
| `/ports` | Catalogue: live search, stack filters, capture counts |
| `/ports/:id` | Overview · Screenshots · Porting · Install · Release |
| `/architecture` | Each seam with its call path and trade-offs, plus a decision table |
| `/builders` | Maintainer profiles and the ports each one looks after |

Data flows one way: pages call `lib/api.js`, which hits `/api/*`. There is no
client cache layer — each page makes the one or two calls it needs and
`lib/hooks.js#useApi` handles loading, error and abort. Filtering and searching
run client-side over the single fetch, so typing never causes a request.

## Design system (`src/index.css`)

Tokens first, then three `@layer base`/`components` rules, then Tailwind
utilities in the components. Nothing else defines a colour.

- **Colour.** One brand accent, HarmonyOS system blue `#0A59F7` on a neutral
  surface ladder. Semantic green/amber/blue soft chips carry status. Per-port
  app icons take a two-tone gradient from each port's own `accent`.
- **The inverse band is dark in both schemes.** Not a theme inversion. The
  porting-patterns band carries `bg-white/[0.04]` overlays and a light accent;
  flipping it per scheme is exactly how those end up invisible. That is what
  `--brand-on-inverse` and `--foreground-inverse-muted` exist for.
- **Type.** `HarmonyOS Sans` when installed, otherwise the platform UI font.
  Letter spacing is `0`; hierarchy comes from size and weight. The only
  exception is the uppercase eyebrow labels, which carry `tracking-[0.14em]`.
- **Rhythm.** 8px grid, the HarmonyOS radius scale, 1px hairlines, three shadow
  levels for the raised and floating layers.
- **Controls.** Capsule buttons in the HarmonyOS hierarchy — filled, tonal,
  outline, text — pill chips for metadata, a segmented control for tabs, and a
  native `<dialog>` as a bottom sheet on phones and a centred panel above `sm`.
- **Navigation.** A sticky translucent top bar; below `lg` it is replaced by a
  HarmonyOS bottom tab bar with filled symbols and a safe-area inset.
- **Motion.** None, by design. The only transitions are 120 ms colour changes.
  `prefers-reduced-motion` collapses them further.

### Contrast

Every text/background token pair is checked above WCAG AA in **both** schemes by
`scripts/build-test.js`, which parses the token blocks out of `src/index.css` and
computes the ratios. The lowest pair currently sits at 4.82:1. The inverse band
has its own assertion, because that is the one that regressed.

## Components

`src/components/ui/` follows the shadcn/ui shape — `cva` variants plus `cn()`,
no component library — with three deliberate departures:

- **Dialog** is a native `<dialog>` opened with `showModal()`, which brings
  focus trapping, Escape handling, page inertness and the top layer from the
  platform. Radix reimplemented all of that in JavaScript.
- **Tabs** are ~40 lines of ARIA plus arrow-key navigation. Unselected panels are
  not mounted at all, so hidden screenshot galleries never download their
  images.
- **Separator** is a styled div; `asChild` on Button is a `cloneElement`.

That removed all five `@radix-ui` packages for 18 kB gzip. The remaining
dependencies are `react`, `react-dom`, `wouter`, `clsx`, `tailwind-merge`,
`class-variance-authority` and `express`.

Icons are a hand-drawn HarmonyOS symbol set in `src/components/symbol.jsx` — 28
symbols on a 24×24 grid as arrays of `<path>` data, with `solid` variants for
the four navigation symbols so the tab bar can mark the active tab the
HarmonyOS way. No icon dependency.

## Accessibility

Skip link, landmarks, one `<h1>` per page with no heading-level skips,
`role="tablist"`/`tabpanel` with `aria-selected` and arrow-key movement,
`aria-current="page"` on navigation, a real combobox in the palette
(`aria-activedescendant`, `role="listbox"`, `<mark>`-free subsequence scoring),
`role="status"` on the catalogue count, non-colour cues on links in running
text, visible focus rings, `prefers-reduced-motion` respected, lazy images with
explicit dimensions, and AA contrast in both schemes.

Lighthouse scores **100 / 100 / 100** on accessibility, best practices and SEO
for `/`, `/ports`, `/ports/:id`, `/architecture`, `/builders` and the 404.

## Screenshots

Captures live in the port repositories, not here. `scripts/fetch-shots.py`
downloads the curated list from `scripts/shots.sources.json`, exports a
viewer-sized JPEG plus a thumbnail into `public/shots/<port>/`, and regenerates
`data/shots.json` with labels, device metadata, the capture method and a link
back to the file on GitHub. 25 captures across the catalogue today.

The gallery is one tab per device form factor, a thumbnail strip, and a
lightbox with previous/next across the whole gallery — all sharing one index
into a flattened list.

Release data comes from the GitHub Releases API per repo (`REPO_MAP` in
`server.js`), cached for 10 minutes, falling back to `data/releases.json` when
the network or the rate limit gives up.

## Budgets

`npm run test:build` fails on any of these:

- JS over 200 kB gzip (currently ~101 kB across 4 chunks, of which React is 68 kB)
- first-party source over 150 kB (currently ~142 kB)
- a `@keyframes`, `animation-timeline`, `view-timeline` or `scroll-timeline` in
  the output CSS
- `IntersectionObserver`, `requestAnimationFrame` or `starfield` in `src/`
- an unhashed asset filename
- a text token pair below AA, or an inverse band that is not dark

## Run / deploy

```sh
npm install
npm run dev      # Vite :5173 + Express :3000, /api proxied
npm run build    # → dist/
npm start        # Express serves dist/ and the API on one port
PORT=8080 npm start
```

`index.html` is served `Cache-Control: no-cache` because it names the hashed
chunks; `/assets/*` is `immutable, max-age=1y`. Deploy anywhere Node runs, or as
a static host plus the handful of API routes. `GET /health` is the probe.