/* AppFactory — shared design-system helpers: app icons, device screens, porting patterns.
   Loaded before the page controllers on every page. */
(function () {
  const AF = (window.AF = {});

  AF.fallback = {
    opengmaps: { accent: "#0077B6", accentDeep: "#0B4F73" },
    opentwit: { accent: "#5856D6", accentDeep: "#33318F" },
    "opentwit-web": { accent: "#0A59F7", accentDeep: "#0A3AA8" },
    ohemacs: { accent: "#5B2EE5", accentDeep: "#2E1A80" },
    whatisit: { accent: "#00A884", accentDeep: "#00614C" }
  };

  AF.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const esc = AF.esc;

  AF.tone = function (app) {
    const fb = AF.fallback[app && app.id] || { accent: "#0A59F7", accentDeep: "#0A3AA8" };
    return {
      tone: (app && app.accent) || fb.accent,
      deep: (app && app.accentDeep) || fb.accentDeep
    };
  };

  AF.patternOf = function (app) {
    const found = AF.PATTERNS.find((p) => p.id === app.id);
    return found ? found.title : "HarmonyOS port";
  };

  /* HarmonyOS Symbols-style glyphs, one per port. */
  const GLYPHS = {
    opengmaps:
      '<path d="M12 21s6.4-5.6 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 15.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="10.4" r="2.4" fill="none" stroke="currentColor" stroke-width="1.9"/>',
    opentwit:
      '<path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    "opentwit-web":
      '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.8 12h16.4M12 3.8c2.4 2.2 3.6 4.9 3.6 8.2s-1.2 6-3.6 8.2c-2.4-2.2-3.6-4.9-3.6-8.2s1.2-6 3.6-8.2z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    ohemacs:
      '<path d="M8.6 19.5 13.4 5 16 6l-4.8 14.2z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M11.6 19.5 15.6 8.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    whatisit:
      '<path d="M20.2 11.6c0 4-3.6 7.2-8.2 7.2-1 0-2-.2-2.9-.5L4.4 20l1.2-3.6A6.9 6.9 0 0 1 3.8 11.6c0-4 3.6-7.2 8.2-7.2s8.2 3.2 8.2 7.2z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'
  };

  AF.iconSVG = function (id, size) {
    const paths = GLYPHS[id] || GLYPHS.opengmaps;
    const px = size || 24;
    return (
      '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' +
      paths +
      "</svg>"
    );
  };

  /* A layered HarmonyOS-style rounded app icon. */
  AF.appIcon = function (app, size) {
    const t = AF.tone(app);
    const px = size || 56;
    return (
      '<span class="app-icon" style="--tone:' + t.tone + ";--tone-deep:" + t.deep + ";width:" + px + "px;height:" + px + "px;border-radius:" +
      Math.round(px * 0.29) + 'px">' +
      AF.iconSVG(app.id, Math.round(px * 0.5)) +
      "</span>"
    );
  };

  AF.statusChip = function (app, extraClass) {
    const tone = app.statusTone === "new" ? "chip--new" : app.statusTone === "wip" ? "chip--warn" : "chip--ok";
    return (
      '<span class="chip chip--status ' + tone + (extraClass ? " " + extraClass : "") + '">' +
      '<span class="chip-dot" aria-hidden="true"></span>' + AF.esc(app.status) +
      "</span>"
    );
  };

  /* ---------------------------------------------------------------------
     Device screens — the app UI drawn inside each mockup frame.
     --------------------------------------------------------------------- */
  const sb =
    '<div class="sb" aria-hidden="true"><span>9:41</span><span class="sb-icons">' +
    '<svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor"><rect x="0" y="6.4" width="2.3" height="3.6" rx="0.7"/><rect x="3.4" y="4.4" width="2.3" height="5.6" rx="0.7"/><rect x="6.8" y="2.2" width="2.3" height="7.8" rx="0.7"/><rect x="10.2" y="0" width="2.3" height="10" rx="0.7"/></svg>' +
    '<svg width="20" height="10" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="17" height="10" rx="3" stroke="currentColor" opacity=".45"/><rect x="2.3" y="2.3" width="12" height="6.4" rx="1.5" fill="currentColor"/><path d="M19.4 3.6v3.8a1.9 1.9 0 0 0 0-3.8z" fill="currentColor" opacity=".45"/></svg>' +
    "</span></div>";

  const tabIcons = [
    '<path d="M3.6 10.6 12 3.6l8.4 7v9.2a1.2 1.2 0 0 1-1.2 1.2h-4.6v-6h-5.2v6H4.8a1.2 1.2 0 0 1-1.2-1.2z"/>',
    '<circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.8 15.8 20.4 20.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    '<path d="M12 3.2a5.6 5.6 0 0 0-5.6 5.6c0 4.4-2 6.2-2 6.2h15.2s-2-1.8-2-6.2A5.6 5.6 0 0 0 12 3.2z"/><path d="M14 18.2a2.2 2.2 0 0 1-4 0z"/>',
    '<rect x="2.6" y="4.4" width="18.8" height="15.2" rx="3.4"/>',
    '<circle cx="12" cy="8.6" r="4.2"/><path d="M4.4 20.4c0-3.7 3.4-6.2 7.6-6.2s7.6 2.5 7.6 6.2z"/>'
  ];

  function tabBar(active) {
    return (
      '<div class="d-tabbar" aria-hidden="true">' +
      tabIcons
        .map(
          (p, i) =>
            '<svg viewBox="0 0 24 24" fill="' + (i === active ? "var(--blue)" : "#9A9BA1") + '" class="' + (i === active ? "on" : "") + '">' + p + "</svg>"
        )
        .join("") +
      "</div>"
    );
  }

  function post(initial, tone, name, handle, time, text, metrics, liked) {
    return (
      '<article class="d-post"><span class="d-avatar" style="background:' + tone + '">' + initial + '</span><div class="d-post-body">' +
      '<div class="d-post-meta"><strong>' + name + "</strong><span>@" + handle + " · " + time + "</span></div>" +
      '<p class="d-post-text">' + text + "</p>" +
      '<div class="d-post-actions"><span>↩ ' + metrics[0] + "</span><span>⟲ " + metrics[1] + '</span><span class="' + (liked ? "liked" : "") + '">♥ ' + metrics[2] + "</span><span>▤ " + metrics[3] + "</span></div>" +
      "</div></article>"
    );
  }

  AF.SCREENS = {
    "opentwit-web":
      '<div class="d-screen d-screen--home">' +
      sb +
      '<div class="d-header"><span class="d-avatar d-avatar--me">A</span>' +
      '<span class="d-switch"><b class="on">For you</b><b>Following</b></span>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3.4l1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L12 14l-4.2 2.4 1.1-4.8-3.7-3.2 4.9-.4z"/></svg>' +
      "</div>" +
      '<div class="d-timeline">' +
      post("H", "#0A59F7", "Harmony Builders", "harmony_build", "2h", "x.com renders in the system Web component — the header, the switcher and the tab bar are native ArkUI.", ["12", "48", "312", "8.1K"], true) +
      post("A", "#1D1D1F", "Abhi", "abhi_flex", "5h", "Injected CSS strips X's own nav, so the shell never draws chrome twice.", ["4", "21", "96", "2.3K"], false) +
      post("S", "#5856D6", "Shenzhen Dev", "sz_dev", "7h", "Rail layout kicks in past 840 vp. Same HAP on the foldable.", ["9", "34", "178", "4.6K"], true) +
      "</div>" +
      '<button class="d-fab" aria-hidden="true"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3.6a2.6 2.6 0 1 1 3.6 3.6L7.4 20.4 3 21.6l1.2-4.4z"/></svg></button>' +
      tabBar(0) +
      "</div>",

    opentwit:
      '<div class="d-screen d-screen--compose">' +
      sb +
      '<div class="d-sheet-backdrop"></div>' +
      '<div class="d-sheet"><div class="d-sheet-grip" aria-hidden="true"></div>' +
      '<div class="d-sheet-bar"><span class="d-link">Cancel</span><b>New post</b><span class="d-pill-btn">Post</span></div>' +
      '<div class="d-editor"><span class="d-avatar d-avatar--me">A</span><div><p>Shipping the ArkTS client build tonight — PKCE sign-in, timeline, DMs.</p><p class="d-mention">@harmony_build</p></div></div>' +
      '<div class="d-editor-tools"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.4" width="18" height="15.2" rx="3"/><circle cx="8.6" cy="10" r="1.6"/><path d="M3.6 17.2 9 12.4l4 3.4 3-2.4 4.4 3.8"/></svg>' +
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.4"/><path d="M8.4 12h7.2M12 8.4v7.2"/></svg>' +
      '<span class="d-counter">62</span></div>' +
      "</div></div>",

    opengmaps:
      '<div class="d-screen d-screen--map">' +
      sb +
      '<div class="d-map" aria-hidden="true"><span class="d-map-water"></span><span class="d-map-park"></span><span class="d-map-road a"></span><span class="d-map-road b"></span><span class="d-map-road c"></span>' +
      '<svg class="d-map-route" viewBox="0 0 280 470" preserveAspectRatio="none"><path d="M46 392 Q92 320 78 258 T172 186 T226 84" fill="none" stroke="#0A59F7" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 11"/><circle cx="46" cy="392" r="7.5" fill="#0A59F7" stroke="#fff" stroke-width="2.6"/><circle cx="226" cy="84" r="7.5" fill="#1D1D1F" stroke="#fff" stroke-width="2.6"/></svg></div>' +
      '<div class="d-searchbar"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7.4"/><path d="M16.4 16.4 21 21" stroke-linecap="round"/></svg><span>Harmony Boulevard, Shenzhen</span></div>' +
      '<div class="d-turn"><span class="d-turn-icon" aria-hidden="true">↱</span><span><b>In 300 m</b><i>Turn right · Harmony Blvd</i></span></div>' +
      '<div class="d-eta"><b>18 min<i>Fastest</i></b><span>7.4 km · arrives 15:42 · vector tiles via ArkWeb</span></div>' +
      "</div>",

    ohemacs:
      '<div class="d-screen d-screen--term">' +
      '<div class="d-term-bar"><span class="d-term-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="d-term-title">OHEmacs — *scratch*</span><span class="d-term-badge">API 24</span></div>' +
      '<div class="d-term-tabs"><span class="on">*scratch*</span><span>ohos-surface.c</span><span>init.el</span></div>' +
      '<div class="d-term-code"><p><span class="c-c">;; GNU Emacs 30.1 · Stage HAP · HarmonyOS 6.1</span></p><p><span class="c-c">;; XComponent surface + NAPI event queue</span></p><p>&nbsp;</p><p><span class="c-k">(defun</span> <span class="c-f">ohos-init-frame</span> ()</p><p>&nbsp;&nbsp;<span class="c-k">(message</span> <span class="c-s">"surface %s ready"</span></p><p>&nbsp;&nbsp;&nbsp;<span class="c-v">(napi-surface-size)</span>))</p><p>&nbsp;</p><p><span class="c-k">(when</span> <span class="c-v">ohos-touch-p</span></p><p>&nbsp;&nbsp;<span class="c-k">(enable-touch-scroll</span> <span class="c-const">:momentum</span> <span class="c-k">t</span>))</p></div>' +
      '<div class="d-modeline"><span class="c-f">-UUU:---</span><span class="c-s">*scratch*</span><span>(Lisp Interaction) · EGL</span></div>' +
      "</div>",

    whatisit:
      '<div class="d-screen d-screen--chat">' +
      sb +
      '<div class="d-chat-head"><span class="d-avatar" style="background:#00A884">W</span><span class="d-chat-meta"><b>Builders, Shenzhen</b><i>online · encrypted</i></span>' +
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M21 16.4v3a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-5.9-5.9 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.4 1.8h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.4 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg></div>' +
      '<div class="d-chat-body"><span class="d-day">Today</span>' +
      '<span class="d-bubble them">QR paired. Companion server on :18770, session alive.<i>15:20</i></span>' +
      '<span class="d-bubble me">History synced — 4,154 messages indexed locally.<i>15:21 · Read</i></span>' +
      '<span class="d-bubble them">Voice path is still experimental on-device.<i>15:22</i></span></div>' +
      '<div class="d-chat-input"><span>Message</span><i class="d-send" aria-hidden="true">↑</i></div>' +
      "</div>"
  };

  AF.mockup = function (app, variant) {
    const wide = app.id === "ohemacs";
    const screen = AF.SCREENS[app.id] || AF.SCREENS.opengmaps;
    const frameClass = wide ? "device device--wide" : "device device--phone";
    return (
      '<div class="' + frameClass + (variant === "preview" ? " device--preview" : "") + '">' +
      '<div class="device-frame">' + (wide ? "" : '<span class="device-cam" aria-hidden="true"></span>') + screen + "</div></div>"
    );
  };

  /* ---------------------------------------------------------------------
     Porting patterns — the five seams shipped so far.
     --------------------------------------------------------------------- */
  AF.PATTERNS = [
    {
      id: "opentwit",
      badge: "01 · ArkTS",
      title: "Native ArkTS app",
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
      ],
      appliesTo: "opentwit"
    },
    {
      id: "opentwit-web",
      badge: "02 · Web shell",
      title: "Native web shell",
      lead: "Keep the service's own web app, and rebuild every piece of chrome around it in ArkUI.",
      desc: [
        "When the target has no practical API — or you want its full feature set on day one — load the web app in the system Web component and own the shell: headers, tab bar or rail, account menu, search, compose sheet.",
        "Injected CSS and JS remove the site's own navigation so nothing renders twice, and the shell reads page state back (document.title, aria-selected) to keep the native chrome in step."
      ],
      flow: ["Native ArkUI chrome", "System Web component", "Injected CSS + JS bridge", "Service web app"],
      points: [
        "Route table per tab: URL, title, user agent and tab index in one place.",
        "Bottom tab bar below 840 vp; side rail above it — one layout tree.",
        "Web hardening: DOM storage on, file access off, mixed mode compatible, WebDarkMode.Auto."
      ],
      appliesTo: "opentwit-web"
    },
    {
      id: "opengmaps",
      badge: "03 · Shim",
      title: "Flutter backport shim",
      lead: "Keep the Dart side untouched and re-implement the missing platform interface.",
      desc: [
        "Flutter on OpenHarmony is real, but Google's plugins are not. The trick is to preserve the stock plugin API and supply the OHOS platform implementation underneath it.",
        "OpenGMaps keeps google_maps_flutter's Dart surface and backs it with the Maps JavaScript API inside ArkWeb, with location and storage as the only native channels."
      ],
      flow: ["Stock plugin Dart API", "OHOS platform interface", "ArkWeb · Maps JS", "Location Kit"],
      points: [
        "No GMS binary ships on-device; tiles come from the official JS API.",
        "Dart-only backport for camera, overlays, events and POI taps.",
        "One narrow native channel (io.opengmaps/location) for GPS."
      ],
      appliesTo: "opengmaps"
    },
    {
      id: "ohemacs",
      badge: "04 · NAPI",
      title: "ArkTS shell + NAPI bridge",
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
      ],
      appliesTo: "ohemacs"
    },
    {
      id: "whatisit",
      badge: "05 · Server",
      title: "Companion server",
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
      ],
      appliesTo: "whatisit"
    }
  ];

  /* Honest compatibility record, one row per port. */
  AF.COMPAT = [
    { id: "opengmaps", target: "OpenHarmony 5.0.1 · API 12", verification: "Verified", tone: "ok", checked: "Emulator, live tiles + search + route", form: "Phone · Tablet" },
    { id: "opentwit", target: "HarmonyOS 6.1.1 · API 24", verification: "Alpha", tone: "warn", checked: "Emulator, signed-in flow", form: "Phone · Tablet · 2in1" },
    { id: "opentwit-web", target: "HarmonyOS 6.1.1 · API 24", verification: "Verified", tone: "ok", checked: "Foldable AVD, signed HAP installed", form: "Phone · Tablet · Foldable · 2in1" },
    { id: "ohemacs", target: "HarmonyOS 6.1.1 · API 24", verification: "Stage 1", tone: "warn", checked: "Harmony_PC_61, GUI shell renders", form: "PC · 2in1 · Tablet" },
    { id: "whatisit", target: "HarmonyOS (current SDK)", verification: "Emulator", tone: "warn", checked: "Emulator, pairing + chats", form: "Phone" }
  ];

  /* Small shared utilities used by several controllers. */
  AF.toast = function (message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-open");
    clearTimeout(AF._toastTimer);
    AF._toastTimer = setTimeout(() => el.classList.remove("is-open"), 2200);
  };

  AF.copy = function (text, message) {
    const ok = () => AF.toast(message || "Copied");
    const legacy = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        ok();
      } catch (e) {
        AF.toast("Copy failed");
      }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(legacy);
    } else {
      legacy();
    }
  };

  /* Mobile menu + bottom tab bar wiring, shared by every page. */
  AF.wireShell = function () {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    const copy = document.getElementById("copyCliBtn");
    if (copy) {
      copy.addEventListener("click", () => {
        AF.copy(
          "git clone https://github.com/Abhi-Flex1/AppFactory.git && cd AppFactory && npm install && npm start",
          "Quickstart copied"
        );
      });
    }
  };

  /* ---------------------------------------------------------------------
     Real device captures.
     The images come from each port repository (see scripts/fetch-shots.py)
     and are served from /shots/. `entry` is one /api/shots/<id> payload:
     { repo, groups: [{ id, title, device, capture, frame, shots: [...] }] }
     --------------------------------------------------------------------- */
  AF.hasShots = function (entry) {
    return !!(entry && entry.groups && entry.groups.some((g) => g.shots && g.shots.length));
  };

  AF.shotFigure = function (shot, frame, extraClass) {
    return (
      '<figure class="shot shot--' + frame + (extraClass ? " " + extraClass : "") + '">' +
      '<img src="' + shot.src + '" width="' + shot.width + '" height="' + shot.height +
      '" alt="' + esc(shot.label) + '" loading="lazy" decoding="async" data-raw="' + shot.raw + '">' +
      "</figure>"
    );
  };

  function groupTabs(groups, activeId) {
    if (groups.length < 2) return "";
    return (
      '<div class="gal-tabs" role="tablist" aria-label="Screen size">' +
      groups
        .map(
          (g) =>
            '<button class="gal-tab' + (g.id === activeId ? " is-active" : "") + '" type="button" role="tab" data-group="' +
            g.id + '" aria-selected="' + (g.id === activeId) + '">' + esc(g.title) +
            ' <span class="gal-tab-count">' + g.shots.length + "</span></button>"
        )
        .join("") +
      "</div>"
    );
  }

  /* Compact viewer with a thumbnail strip — used in the home device stage. */
  AF.galleryHTML = function (app, entry) {
    if (!AF.hasShots(entry)) return "";
    const groups = entry.groups.filter((g) => g.shots.length);
    const group = groups[0];
    const shot = group.shots[0];
    return (
      '<div class="gal" data-gal data-app="' + app.id + '">' +
      groupTabs(groups, group.id) +
      '<div class="gal-stage" data-gal-stage>' + AF.shotFigure(shot, group.frame) + "</div>" +
      '<div class="gal-meta">' +
      '<p class="gal-caption" data-gal-caption>' + esc(shot.label) + "</p>" +
      '<p class="gal-device" data-gal-device>' + esc(group.capture) + (group.device ? " · " + esc(group.device) : "") + "</p>" +
      '<a class="link-quiet" data-gal-source href="' + shot.source + '" target="_blank" rel="noopener">Open the capture on GitHub</a>' +
      "</div>" +
      '<div class="gal-thumbs" data-gal-thumbs role="tablist" aria-label="Captures">' +
      group.shots
        .map(
          (s, i) =>
            '<button class="gal-thumb' + (i === 0 ? " is-active" : "") + '" type="button" role="tab" title="' +
            esc(s.label) + '" aria-selected="' + (i === 0) + '" data-shot="' + s.id + '">' +
            '<img src="' + s.thumb + '" alt="' + esc(s.label) + '" loading="lazy" decoding="async">' +
            "</button>"
        )
        .join("") +
      "</div></div>"
    );
  };

  /* Full grid for the project page — every capture in the group, click to enlarge. */
  AF.shotGridHTML = function (app, entry) {
    if (!AF.hasShots(entry)) return "";
    const groups = entry.groups.filter((g) => g.shots.length);
    const group = groups[0];
    return (
      '<div class="gal-grid-wrap" data-gal data-app="' + app.id + '">' +
      groupTabs(groups, group.id) +
      '<p class="gal-device" data-gal-device>' + esc(group.capture) + (group.device ? " · " + esc(group.device) : "") + "</p>" +
      '<div class="shot-grid" data-gal-grid>' +
      group.shots
        .map(
          (s) =>
            '<button class="shot-card" type="button" data-shot="' + s.id + '">' +
            AF.shotFigure(s, group.frame) +
            '<span class="shot-card-label">' + esc(s.label) + "</span></button>"
        )
        .join("") +
      "</div></div>"
    );
  };

  function currentGroup(root, entry) {
    const active = root.querySelector(".gal-tab.is-active");
    const id = active ? active.dataset.group : entry.groups[0].id;
    return entry.groups.find((g) => g.id === id) || entry.groups[0];
  }

  /* Wire a mounted gallery: group switch, thumbnail switch, lightbox. */
  AF.wireGallery = function (root, app, entry) {
    const stage = root.querySelector("[data-gal-stage]");
    const grid = root.querySelector("[data-gal-grid]");
    const caption = root.querySelector("[data-gal-caption]");
    const device = root.querySelector("[data-gal-device]");
    const source = root.querySelector("[data-gal-source]");
    const thumbs = root.querySelector("[data-gal-thumbs]");

    root.addEventListener("click", (event) => {
      const groupBtn = event.target.closest(".gal-tab");
      if (groupBtn) {
        root.querySelectorAll(".gal-tab").forEach((b) => {
          const on = b === groupBtn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", String(on));
        });
        const group = currentGroup(root, entry);
        if (stage) {
          stage.innerHTML = AF.shotFigure(group.shots[0], group.frame);
          if (caption) caption.textContent = group.shots[0].label;
          if (source) source.href = group.shots[0].source;
        }
        if (device) device.textContent = group.capture + (group.device ? " · " + group.device : "");
        if (thumbs) {
          thumbs.innerHTML = group.shots
            .map(
              (s, i) =>
                '<button class="gal-thumb' + (i === 0 ? " is-active" : "") + '" type="button" title="' + esc(s.label) +
                '" data-shot="' + s.id + '"><img src="' + s.thumb + '" alt="" loading="lazy"></button>'
            )
            .join("");
        }
        if (grid) {
          grid.innerHTML = group.shots
            .map(
              (s) =>
                '<button class="shot-card" type="button" data-shot="' + s.id + '">' + AF.shotFigure(s, group.frame) +
                '<span class="shot-card-label">' + esc(s.label) + "</span></button>"
            )
            .join("");
        }
        return;
      }

      const thumb = event.target.closest(".gal-thumb");
      if (thumb && thumbs && stage) {
        const group = currentGroup(root, entry);
        const shot = group.shots.find((s) => s.id === thumb.dataset.shot);
        if (!shot) return;
        thumbs.querySelectorAll(".gal-thumb").forEach((t) => {
          const on = t === thumb;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", String(on));
        });
        stage.innerHTML = AF.shotFigure(shot, group.frame);
        if (caption) caption.textContent = shot.label;
        if (source) source.href = shot.source;
        return;
      }

      const card = event.target.closest(".shot-card");
      if (card) {
        const group = currentGroup(root, entry);
        const shot = group.shots.find((s) => s.id === card.dataset.shot);
        if (shot) AF.openLightbox(app, shot, group);
      }
    });
  };

  /* Full-size viewer for a single capture. */
  AF.openLightbox = function (app, shot, group) {
    let box = document.getElementById("lightbox");
    if (!box) {
      box = document.createElement("div");
      box.id = "lightbox";
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6 18 18M18 6 6 18"/></svg></button>' +
        '<figure class="lightbox-body"><img alt=""><figcaption><b></b><span></span>' +
        '<a class="link-arrow" target="_blank" rel="noopener">Open the capture on GitHub</a></figcaption></figure>';
      document.body.appendChild(box);
      const close = () => AF.closeLightbox();
      box.querySelector(".lightbox-close").addEventListener("click", close);
      box.addEventListener("click", (e) => {
        if (e.target === box) close();
      });
    }
    const img = box.querySelector("img");
    img.src = shot.src;
    img.alt = app.name + " — " + shot.label;
    img.width = shot.width;
    img.height = shot.height;
    box.querySelector("figcaption b").textContent = app.name + " — " + shot.label;
    box.querySelector("figcaption span").textContent = group.capture + (group.device ? " · " + group.device : "");
    box.querySelector("figcaption a").href = shot.source;
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close").focus();
    AF._lightboxKey =
      AF._lightboxKey ||
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") AF.closeLightbox();
      });
  };

  AF.closeLightbox = function () {
    const box = document.getElementById("lightbox");
    if (!box || !box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  /* Home page wall: a curated slice of real captures across every port. */
  AF.mountCaptureWall = function (root, apps, shots, picks) {
    if (!root) return;
    const cards = [];
    picks.forEach((pick) => {
      const app = apps.find((a) => a.id === pick.app);
      const entry = shots[pick.app];
      if (!app || !AF.hasShots(entry)) return;
      const group = entry.groups.find((g) => g.id === pick.group) || entry.groups[0];
      const shot = group.shots.find((s) => s.id === pick.shot) || group.shots[0];
      cards.push(
        '<button class="wall-card" type="button" data-app="' + app.id + '" data-frame="' + group.frame +
        '" data-src="' + shot.src + '" data-raw="' + shot.raw + '" data-label="' + esc(app.name + " — " + shot.label) +
        '" data-device="' + esc(group.device) + '" data-source="' + shot.source + '">' +
        '<span class="shot shot--' + group.frame + '"><img src="' + shot.src + '" width="' + shot.width +
        '" height="' + shot.height + '" alt="' + esc(app.name + " — " + shot.label) + '" loading="lazy" decoding="async"></span>' +
        '<span class="wall-meta"><b>' + esc(app.name) + "</b><span>" + esc(shot.label) + "</span></span>" +
        "</button>"
      );
    });
    root.innerHTML = cards.join("");
    root.addEventListener("click", (event) => {
      const card = event.target.closest(".wall-card");
      if (!card) return;
      const app = apps.find((a) => a.id === card.dataset.app);
      AF.openLightbox(
        app || { name: "AppFactory" },
        { src: card.dataset.src, raw: card.dataset.raw, label: card.dataset.label, width: 0, height: 0, source: card.dataset.source },
        { capture: "Real device capture", device: card.dataset.device }
      );
    });
  };
})();
