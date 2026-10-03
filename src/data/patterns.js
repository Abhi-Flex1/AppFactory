/**
 * The porting patterns and the compatibility record. One pattern per port so far:
 * each port chose a seam, and the seam is the thing worth teaching.
 */

export const PATTERNS = [
  {
    id: "opentwit",
    badge: "01",
    symbol: "sparkle",
    title: "Native ArkTS app",
    kind: "Direct",
    lead: "Write the client against the HarmonyOS SDK and the vendor API, nothing in between.",
    desc: [
      "The default answer when the service has an API and no GMS dependency: a Stage-model HAP with Navigation, Tabs and SymbolGlyph icons, talking straight to the vendor over HTTPS.",
      "Sign-in runs as an OAuth 2.0 PKCE flow in an embedded browser — no client secret ever ships in the package, and the token lives in HarmonyOS preferences."
    ],
    flow: ["ArkTS UI · Navigation + Tabs", "OAuth 2.0 PKCE · embedded browser", "Vendor API over HTTPS"],
    points: [
      "One HAP covers phone, tablet and 2in1 through responsive layout.",
      "Zero-setup sample data keeps the UI testable without credentials.",
      "Paid-access states (HTTP 402) are surfaced, not hidden behind a spinner."
    ]
  },
  {
    id: "opentwit-web",
    badge: "02",
    symbol: "browser",
    title: "Native web shell",
    kind: "Shell",
    lead: "Keep the service's own web app, and rebuild every piece of chrome around it in ArkUI.",
    desc: [
      "When the target has no practical API — or you want the service's full feature set on day one — load its web app in the system Web component and own the shell: headers, tab bar or rail, account menu, search, compose sheet.",
      "Injected CSS and JS remove the site's own navigation so nothing renders twice, and the shell reads page state back (document.title, aria-selected) to keep the native chrome in step."
    ],
    flow: ["Native ArkUI chrome", "System Web component", "Injected CSS + JS bridge", "Service web app"],
    points: [
      "Route table per tab: URL, title, user agent and tab index in one place.",
      "Bottom tab bar below 840 vp; side rail above it — one layout tree.",
      "Web hardening: DOM storage on, file access off, mixed mode compatible, WebDarkMode.Auto."
    ]
  },
  {
    id: "reel-edit",
    badge: "03",
    symbol: "film",
    title: "Upstream web host",
    kind: "Bridge",
    lead: "Run a large upstream web app unmodified, then supply the platform layer it was missing.",
    desc: [
      "OpenReel Video is a whole application — timeline, engine, panels, export pipeline. Rewriting it would mean rewriting 5,000 stars' worth of work, so the port hosts it instead: ArkWeb serves the upstream bundle over a virtual https:// origin and the editor runs untouched.",
      "What the port adds is everything the browser used to provide for free: a synchronous JS proxy, a native H.264/AAC encoder feeding the platform muxer, the system save picker, and the device theme."
    ],
    flow: [
      "Upstream React bundle · unmodified",
      "ArkWeb · virtual https:// origin",
      "registerJavaScriptProxy · synchronous",
      "OH_VideoEncoder + OH_AVMuxer · native MP4"
    ],
    points: [
      "The async JS proxy does not marshal a Promise, so the bridge hands off and replies via __openreelResolve.",
      "Binary crosses the JSON proxy as base64; the message-port handoff succeeds natively and never reaches the page.",
      "Three upstream changes only: no in-app window controls, device-driven theme, WebCodecs export path removed."
    ]
  },
  {
    id: "opengmaps",
    badge: "04",
    symbol: "map",
    title: "Flutter backport shim",
    kind: "Shim",
    lead: "Keep the Dart side untouched and re-implement the missing platform interface underneath it.",
    desc: [
      "Flutter on OpenHarmony is real, but Google's plugins are not. The trick is to preserve the stock plugin API and supply the OHOS platform implementation behind it.",
      "OpenGMaps keeps google_maps_flutter's Dart surface and backs it with the Maps JavaScript API inside ArkWeb, with location and storage as the only native channels."
    ],
    flow: ["Stock plugin Dart API", "OHOS platform interface", "ArkWeb · Maps JS", "Location Kit"],
    points: [
      "No GMS binary ships on-device; tiles come from the official JS API.",
      "Dart-only backport for camera, overlays, events and POI taps.",
      "One narrow native channel (io.opengmaps/location) for GPS."
    ]
  },
  {
    id: "ohemacs",
    badge: "05",
    symbol: "lambda",
    title: "ArkTS shell + NAPI bridge",
    kind: "Bridge",
    lead: "Wrap an existing C or C++ engine in a Stage window and give it a GPU surface.",
    desc: [
      "Large upstream codebases are cheaper to cross-compile than to rewrite. OHEmacs builds GNU Emacs 30.1 with the OpenHarmony NDK, then hands it an XComponent surface and a thread-safe event queue.",
      "The ArkTS side owns the window, lifecycle and input; the C side owns rendering and its own Lisp runtime."
    ],
    flow: ["Stage window · EntryAbility", "XComponent · EGL surface", "NAPI · libentry.so", "C engine"],
    points: [
      "EGL draws straight to the GPU surface — no canvas round trip.",
      "Touch, key and resize events cross a dual-write NAPI queue.",
      "The same tree also builds a standalone aarch64 CLI binary."
    ]
  },
  {
    id: "whatisit",
    badge: "06",
    symbol: "server",
    title: "Companion server",
    kind: "Server",
    lead: "Keep protocol and crypto in a daemon you control; ship a thin native client.",
    desc: [
      "Some protocols are too heavy, too rate-limited or too legally murky to run on a phone. Moving the session to a small server keeps the device client small, restartable and quick to iterate.",
      "WhatIsIt pairs once by QR or an 8-character code; the Go daemon holds the Multi-Device session, SQLite index and keepalive, and pushes events to the client over WebSocket."
    ],
    flow: ["ArkTS client", "WebSocket / HTTP", "Go daemon", "Messaging protocol"],
    points: [
      "Sessions survive app and server restarts; media is cached server-side.",
      "Wire-compatible across two server implementations (Go and a Rust reference).",
      "Deploy anywhere Go runs — a VPS with Caddy or a Cloudflare tunnel for TLS."
    ]
  }
];

/** The honest compatibility record: one row per port, as verified — not as hoped. */
export const COMPAT = [
  {
    id: "reel-edit",
    target: "HarmonyOS 6.1.1 · API 24",
    verification: "Beta",
    tone: "warn",
    checked: "2in1 emulator 3120×2080 — editor, project persistence, export pipeline",
    form: "2in1"
  },
  {
    id: "opengmaps",
    target: "OpenHarmony 5.0.1 · API 12",
    verification: "Verified",
    tone: "ok",
    checked: "Emulator — live tiles, place search, routing",
    form: "Phone · Tablet"
  },
  {
    id: "opentwit",
    target: "HarmonyOS 6.1.1 · API 24",
    verification: "Alpha",
    tone: "warn",
    checked: "Emulator — signed-in flow, sample data",
    form: "Phone · Tablet · 2in1"
  },
  {
    id: "opentwit-web",
    target: "HarmonyOS 6.1.1 · API 24",
    verification: "Verified",
    tone: "ok",
    checked: "Foldable AVD — signed HAP installed and running",
    form: "Phone · Tablet · Foldable · 2in1"
  },
  {
    id: "ohemacs",
    target: "HarmonyOS 6.1.1 · API 24",
    verification: "Stage 1",
    tone: "warn",
    checked: "Harmony_PC_61 — GUI shell launches and renders",
    form: "PC · 2in1 · Tablet"
  },
  {
    id: "whatisit",
    target: "HarmonyOS (current SDK)",
    verification: "Emulator",
    tone: "warn",
    checked: "Emulator — pairing and chats; calls unverified",
    form: "Phone"
  }
];

export const patternFor = (appId) => PATTERNS.find((p) => p.id === appId) ?? null;
export const compatFor = (appId) => COMPAT.find((c) => c.id === appId) ?? null;