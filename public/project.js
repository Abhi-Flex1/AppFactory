/* Project page controller — refined mockups, no emoji. */
function getAppIdFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "apps" && parts[1]) return parts[1].toLowerCase();
  const q = new URLSearchParams(window.location.search).get("id");
  return (q || "opengmaps").toLowerCase();
}
const currentAppId = getAppIdFromURL();
const SOLID = { opengmaps: "#007aff", ohemacs: "#1d1d1f", whatisit: "#12805c", opentwit: "#5856d6" };
const GLYPH = { opengmaps: "G", ohemacs: "E", whatisit: "W", opentwit: "T" };

let toastTimeout;
function showToast(msg) {
  const t = document.getElementById("toast"); if (!t) return;
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.add("hidden"), 2200);
}
function copyText(text, msg) {
  msg = msg || "Copied";
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => legacyCopy(text, msg));
  else legacyCopy(text, msg);
}
function legacyCopy(text, msg) {
  const el = document.createElement("textarea");
  el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
  document.body.appendChild(el); el.select();
  try { document.execCommand("copy"); showToast(msg); } catch (e) { showToast("Copy failed"); }
  document.body.removeChild(el);
}
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const MOCKUPS = {
  opengmaps: '<div class="device-mockup phone-mockup active"><div class="phone-frame"><div class="phone-island"><span class="island-camera"></span></div><div class="phone-screen screen-map"><div class="phone-statusbar" aria-hidden="true"><span>9:41</span><span class="sb-icons"><svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><rect x="0" y="7" width="2.4" height="4" rx="0.6"/><rect x="3.6" y="5" width="2.4" height="6" rx="0.6"/><rect x="7.2" y="2.6" width="2.4" height="8.4" rx="0.6"/><rect x="10.8" y="0" width="2.4" height="11" rx="0.6"/></svg></span></div><div class="map-bg"><div class="map-water"></div><div class="map-park"></div><div class="map-highway"></div><div class="map-road-1"></div><div class="map-road-2"></div><svg class="map-polyline" viewBox="0 0 280 460" preserveAspectRatio="none"><path d="M 50 380 Q 90 320 80 260 T 170 190 T 220 90" fill="none" stroke="#0A59F7" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 10" /><circle cx="50" cy="380" r="7" fill="#0A59F7" stroke="#fff" stroke-width="2.5" /><circle cx="220" cy="90" r="7" fill="#1d1d1f" stroke="#fff" stroke-width="2.5" /></svg></div><div class="map-search-bar"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Harmony Boulevard, Shenzhen</span></div><div class="map-turn-card"><div class="turn-icon">↱</div><div class="turn-info"><div class="turn-dist">In 300 m</div><div class="turn-street">Turn right · Harmony Blvd</div></div></div><div class="map-eta-card"><div class="eta-time">18 min<small>Fastest</small></div><div class="eta-details">7.4 km · Arrives 15:42</div></div></div></div></div>',
  ohemacs: '<div class="device-mockup tablet-mockup active"><div class="tablet-frame"><div class="window-titlebar"><div class="window-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="window-title">OHEmacs — *scratch* · Stage</div><div class="window-badge">API 24</div></div><div class="window-screen screen-term"><div class="term-tabs"><span class="term-tab active">*scratch*</span><span class="term-tab">ohos-surface.c</span><span class="term-tab">init.el</span></div><div class="term-code"><p><span class="c-comment">;; GNU Emacs 30.1 · Stage HAP · HarmonyOS 6.1</span></p><p><span class="c-comment">;; XComponent EGL + NAPI event queue</span></p><p><br /></p><p><span class="c-keyword">(defun</span> <span class="c-fn">ohos-init-frame</span> ()</p><p>&nbsp;&nbsp;<span class="c-keyword">(message</span> <span class="c-string">"surface %s ready"</span></p><p>&nbsp;&nbsp;&nbsp;<span class="c-var">(napi-surface-size)</span>))</p></div><div class="term-modeline"><span class="mod-status">-UUU:---</span><span class="mod-name">*scratch*</span><span class="mod-info">(Lisp) · EGL</span></div></div></div></div>',
  whatisit: '<div class="device-mockup phone-mockup active"><div class="phone-frame"><div class="phone-island"><span class="island-camera"></span></div><div class="phone-screen screen-chat"><div class="phone-statusbar" aria-hidden="true"><span>9:41</span><span class="sb-icons"><svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><rect x="0" y="7" width="2.4" height="4" rx="0.6"/><rect x="3.6" y="5" width="2.4" height="6" rx="0.6"/><rect x="7.2" y="2.6" width="2.4" height="8.4" rx="0.6"/><rect x="10.8" y="0" width="2.4" height="11" rx="0.6"/></svg></span></div><div class="chat-header"><div class="chat-avatar">W</div><div class="chat-meta"><div class="chat-name">Builders, Shenzhen</div><div class="chat-sub">online · encrypted</div></div></div><div class="chat-messages"><div class="chat-date">Today</div><div class="bubble bubble-them"><p>QR paired. Server on :18770, session alive.</p><span class="bubble-time">15:20</span></div><div class="bubble bubble-me"><p>History synced — 4,154 messages indexed.</p><span class="bubble-time">15:21 · Read</span></div><div class="bubble bubble-them"><p>Voice path still experimental on-device.</p><span class="bubble-time">15:22</span></div></div><div class="chat-input-bar"><span class="chat-input-placeholder">Message</span><div class="chat-send-btn">↑</div></div></div></div></div>',
  opentwit: '<div class="device-mockup phone-mockup active"><div class="phone-frame"><div class="phone-island"><span class="island-camera"></span></div><div class="phone-screen screen-x"><div class="phone-statusbar" aria-hidden="true"><span>9:41</span><span class="sb-icons"><svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><rect x="0" y="7" width="2.4" height="4" rx="0.6"/><rect x="3.6" y="5" width="2.4" height="6" rx="0.6"/><rect x="7.2" y="2.6" width="2.4" height="8.4" rx="0.6"/><rect x="10.8" y="0" width="2.4" height="11" rx="0.6"/></svg></span></div><div class="x-header"><span class="x-title">Home</span><span class="x-head-ic"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></span></div><div class="x-timeline"><article class="x-post"><div class="x-avatar" style="background:#007aff">H</div><div class="x-body"><div class="x-meta"><strong>Harmony Builders</strong><span>@harmony_build · 2h</span></div><p class="x-text">Timeline renders in native ArkTS. Pull to refresh actually refreshes.</p><div class="x-actions"><span>↩ 12</span><span>⟲ 48</span><span class="liked">♥ 312</span><span>▤ 8.1K</span></div></div></article><article class="x-post"><div class="x-avatar" style="background:#1d1d1f">A</div><div class="x-body"><div class="x-meta"><strong>Abhi</strong><span>@abhi_flex · 5h</span></div><p class="x-text">OAuth PKCE sign-in works in the embedded browser. No API keys to paste.</p><div class="x-actions"><span>↩ 4</span><span>⟲ 21</span><span>♡ 96</span><span>▤ 2.3K</span></div></div></article><article class="x-post"><div class="x-avatar" style="background:#5856d6">X</div><div class="x-body"><div class="x-meta"><strong>X API</strong><span>@xapi · 1d</span></div><p class="x-text">Free tier limits apply here. OpenTwit shows the 402 instead of spinning.</p><div class="x-actions"><span>↩ 0</span><span>⟲ 2</span><span>♡ 11</span><span>▤ 640</span></div></div></article></div><div class="x-fab"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></div><div class="x-tabs"><svg class="on" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 7L2 7"/></svg></div></div></div></div>'
};

const ARCH_DETAILS = {
  opengmaps: {
    patternTitle: "01 · Flutter backport shim",
    patternSub: "Stock Dart API on top, OHOS platform interface in the middle, ArkWeb + Location Kit underneath.",
    diagram: '<div class="pattern-flow"><div class="flow-step">google_maps_flutter · Dart API</div><div class="flow-arrow">↓ method channel</div><div class="flow-step highlight">google_maps_flutter_ohos · platform impl</div><div class="flow-arrow">↓ JSON</div><div class="flow-step">ArkWeb · Maps JS 3.56</div><div class="flow-arrow">↓ callback</div><div class="flow-step highlight">Location Kit · GPS</div></div>',
    points: ["No GMS binary: official vector tiles through ArkWeb.", "Places autocomplete + details over HTTP, debounced.", "One narrow native channel (io.opengmaps/location) for GPS.", "Permissions: INTERNET, LOCATION, APPROXIMATELY_LOCATION."]
  },
  ohemacs: {
    patternTitle: "02 · ArkTS shell + NAPI bridge",
    patternSub: "A Stage HAP window around GNU Emacs 30.1, with an EGL surface and a thread-safe event queue.",
    diagram: '<div class="pattern-flow"><div class="flow-step">Stage window · EntryAbility</div><div class="flow-arrow">↓ surface</div><div class="flow-step highlight">XComponent · EGL / GLES 3.0</div><div class="flow-arrow">↓ events</div><div class="flow-step">NAPI · libentry.so</div><div class="flow-arrow">↓ pipes</div><div class="flow-step highlight">Emacs 30.1 core + Lisp VM</div></div>',
    points: ["EGL surface straight to the GPU, no canvas copies.", "Touch, key and resize events via a dual-write queue.", "Cross-built with the OpenHarmony LLVM NDK (musl, aarch64).", "Same tree builds a standalone CLI (/data/local/tmp/emacs)."]
  },
  whatisit: {
    patternTitle: "03 · Companion server",
    patternSub: "Session and crypto live in a Go daemon; the phone stays a thin ArkTS client on WebSocket push.",
    diagram: '<div class="pattern-flow"><div class="flow-step">ArkTS client · CdpBridge</div><div class="flow-arrow">↕ WebSocket / HTTP</div><div class="flow-step highlight">Go daemon · whatsmeow</div><div class="flow-arrow">↕ E2E protocol</div><div class="flow-step">Messaging network</div></div>',
    points: ["Pair once: in-app QR or 8-character code. No browser.", "Go owns SQLite session, index and keepalive.", "ArkTS gets instant push over WebSocket.", "Voice/video via meowcaller — experimental on-device."]
  },
  opentwit: {
    patternTitle: "Native Stage client · X API v2",
    patternSub: "Greenfield-native ArkTS app: bottom Tabs UI over the X API with OAuth 2.0 PKCE sign-in — no shim, no companion server.",
    diagram: '<div class="pattern-flow"><div class="flow-step">ArkTS Tabs UI · SymbolGlyph</div><div class="flow-arrow">↕ HTTPS</div><div class="flow-step highlight">OAuth 2.0 PKCE · embedded browser</div><div class="flow-arrow">↕ REST</div><div class="flow-step">X API v2 · timeline + DMs</div></div>',
    points: ["Sign in with X via OAuth 2.0 PKCE — the only auth, no user keys.", "Sample timeline with zero setup; live data unlocks on sign-in.", "Honest paid-access states (HTTP 402) instead of silent failures.", "One Stage-model HAP for phone, tablet and 2in1 (EntryAbility)."]
  }
};

async function loadProject() {
  try {
    const [appsRes, relRes, contribRes] = await Promise.all([
      fetch("/api/apps"), fetch("/api/releases/" + currentAppId), fetch("/api/contributors")
    ]);
    const apps = await appsRes.json();
    const app = apps.find((a) => a.id === currentAppId) || apps[0];
    const release = relRes.ok ? await relRes.json() : null;
    const contributors = contribRes.ok ? await contribRes.json() : [];

    document.title = app.name + " — AppFactory";
    const pageUrl = "https://appfactoryhos.vercel.app/apps/" + app.id;
    const canon = document.getElementById("canonicalLink"); if (canon) canon.href = pageUrl;
    const ogu = document.getElementById("ogUrl"); if (ogu) ogu.setAttribute("content", pageUrl);
    const bread = document.getElementById("breadProjectName"); if (bread) bread.textContent = app.name;
    const glyph = document.getElementById("projectGlyph");
    if (glyph) { glyph.textContent = GLYPH[app.id] || "A"; glyph.style.background = SOLID[app.id] || "#1d1d1f"; }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("projectName", app.name); set("projectTagline", app.tagline); set("projectDesc", app.description);
    set("projectStatus", app.status); set("projectCategory", app.category);
    set("specTarget", app.api); set("specBundle", app.bundle); set("specLicense", app.license);
    set("specStack", (app.stack || []).join(" · "));
    const repo = document.getElementById("heroRepoBtn"); if (repo) repo.href = app.repo;
    const copyBtn = document.getElementById("heroCopyInstallBtn");
    if (copyBtn) copyBtn.onclick = () => copyText(app.install, "Install command copied");
    const dl = document.getElementById("heroDownloadBtn");
    const dlLabel = document.getElementById("heroDownloadLabel");
    if (release && release.assets && release.assets.length) {
      const primary = release.assets.find((a) => a.type === "hap") || release.assets[0];
      if (dl && primary) { dl.href = primary.downloadUrl; dl.setAttribute("download", primary.name); }
      if (dlLabel && primary) dlLabel.textContent = "Download " + primary.name + " (" + primary.formattedSize + ")";
    } else {
      if (dl) dl.href = app.repo;
      if (dlLabel) dlLabel.textContent = "View source";
    }
    renderDownloads(app, release);
    renderPreview(app, contributors);
    renderArchitecture(app);
    renderInstallation(app, release);
    renderOtherPorts(apps, app.id);
    set("projectDisclaimerText", app.disclaimer || "");
    setupTabs(); setupCopyButtons();
  } catch (e) { console.error(e); }
}

function renderDownloads(app, release) {
  const titleEl = document.getElementById("relTitle");
  const metaEl = document.getElementById("relMeta");
  const tagEl = document.getElementById("relTag");
  const gridEl = document.getElementById("releaseAssetsGrid");
  const ghLink = document.getElementById("relGhLink");
  const bodyEl = document.getElementById("relBody");
  if (!release || !release.assets || !release.assets.length) {
    if (titleEl) titleEl.textContent = app.name + " — source";
    if (metaEl) metaEl.textContent = "No packaged release yet. Build from source.";
    if (tagEl) tagEl.textContent = "main";
    if (ghLink) ghLink.href = app.repo;
    if (bodyEl) bodyEl.textContent = "Build from source with the Install tab.";
    if (gridEl) gridEl.innerHTML = '<div class="asset-card"><div class="asset-header-row"><div class="asset-icon zip">ZIP</div><div class="asset-badges"><span class="asset-size-pill">Source</span></div></div><div class="asset-info"><h4 class="asset-name font-mono">Repository source</h4><p class="asset-label">Latest tree from GitHub</p></div><div class="asset-actions"><a class="btn-download-asset" href="' + app.repo + '/archive/refs/heads/main.zip" target="_blank" rel="noopener"><span>Download ZIP</span></a></div></div>';
    return;
  }
  if (titleEl) titleEl.textContent = release.name || (app.name + " " + release.tagName);
  const d = release.publishedAt ? new Date(release.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
  if (metaEl) metaEl.textContent = d ? ("Published " + d + " · from GitHub Releases") : "From GitHub Releases";
  if (tagEl) tagEl.textContent = release.tagName;
  if (ghLink) ghLink.href = release.htmlUrl || (app.repo + "/releases");
  if (bodyEl) bodyEl.textContent = release.body || "No notes provided.";
  if (gridEl) {
    gridEl.innerHTML = release.assets.map((a) => {
      const isHap = a.type === "hap";
      const cls = isHap ? "hap" : (a.type === "binary" || a.type === "service" ? "bin" : "zip");
      const mark = isHap ? ".HAP" : (cls === "bin" ? "BIN" : "ZIP");
      return '<div class="asset-card' + (isHap ? " featured-asset" : "") + '"><div class="asset-header-row"><div class="asset-icon ' + cls + '">' + mark + '</div><div class="asset-badges">' + (isHap ? '<span class="badge-primary-asset">Device build</span>' : "") + '<span class="asset-size-pill">' + esc(a.formattedSize) + "</span></div></div>" +
        '<div class="asset-info"><h4 class="asset-name font-mono">' + esc(a.name) + '</h4><p class="asset-label">' + esc(a.label || "") + "</p>" + (a.installHint ? '<code class="asset-install-hint">$ ' + esc(a.installHint) + "</code>" : "") + "</div>" +
        '<div class="asset-actions"><a class="btn-download-asset' + (isHap ? " primary" : "") + '" href="' + a.downloadUrl + '" target="_blank" rel="noopener" download="' + esc(a.name) + '"><span>Download</span></a>' + (a.installHint ? '<button class="btn-copy-install-hint" data-hint="' + esc(a.installHint) + '">Copy install command</button>' : "") + "</div></div>";
    }).join("");
    gridEl.querySelectorAll(".btn-copy-install-hint").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.hint, "Command copied")));
  }
}

function renderPreview(app, contributors) {
  const slot = document.getElementById("previewMockupSlot");
  if (slot) slot.innerHTML = MOCKUPS[app.id] || MOCKUPS.opengmaps;
  const fl = document.getElementById("previewFeaturesList");
  if (fl) fl.innerHTML = (app.features || []).map((f) => "<li><span class='chk'>✓</span><span>" + esc(f) + "</span></li>").join("");
  const ml = document.getElementById("previewMaintainersList");
  if (ml) {
    const makers = (app.maintainers || []).map((mid) => contributors.find((c) => c.id === mid) || { name: mid, github: "https://github.com/" + mid });
    ml.innerHTML = makers.map((m) => '<div class="maintainer-card-mini"><div class="m-avatar">' + esc((m.name || "A").charAt(0).toUpperCase()) + '</div><div class="m-meta"><strong>' + esc(m.name) + "</strong><span>" + esc(m.role || "Maintainer") + '</span></div><a class="m-link" href="' + m.github + '" target="_blank" rel="noopener">GitHub</a></div>').join("");
  }
}

function renderArchitecture(app) {
  const arch = ARCH_DETAILS[app.id] || ARCH_DETAILS.opengmaps;
  const t = document.getElementById("archPatternTitle"); if (t) t.textContent = arch.patternTitle;
  const s = document.getElementById("archPatternSub"); if (s) s.textContent = arch.patternSub;
  const d = document.getElementById("archFlowDiagram"); if (d) d.innerHTML = arch.diagram;
  const pl = document.getElementById("archPointsList");
  if (pl) pl.innerHTML = arch.points.map((p) => "<li>" + esc(p) + "</li>").join("");
}

function renderInstallation(app, release) {
  const hdc = document.getElementById("installHdcCode");
  const build = document.getElementById("installBuildCode");
  let hap = app.id + ".hap";
  if (release && release.assets) {
    const h = release.assets.find((a) => a.type === "hap");
    if (h) hap = h.name;
  }
  if (hdc) hdc.textContent = "# Download " + hap + " from Downloads\nhdc list targets\nhdc install " + hap + "\nhdc shell aa start -a EntryAbility -b " + app.bundle;
  if (build) build.textContent = app.install || ("git clone " + app.repo);
}

function renderOtherPorts(apps, currentId) {
  const g = document.getElementById("otherPortsGrid"); if (!g) return;
  g.innerHTML = apps.filter((a) => a.id !== currentId).map((a) =>
    '<a href="/apps/' + a.id + '" class="other-port-card"><div class="other-glyph" style="background:' + (SOLID[a.id] || "#1d1d1f") + '">' + (GLYPH[a.id] || "A") + '</div><div class="other-info"><span class="other-name">' + esc(a.name) + '</span><span class="other-tagline">' + esc(a.tagline) + '</span></div><span class="other-arrow">›</span></a>'
  ).join("");
}

function setupTabs() {
  const btns = document.querySelectorAll(".project-tab-btn");
  const panes = document.querySelectorAll(".project-tab-pane");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
    panes.forEach((p) => p.classList.remove("active"));
    b.classList.add("active"); b.setAttribute("aria-selected", "true");
    const pane = document.getElementById("pane-" + b.dataset.pane);
    if (pane) pane.classList.add("active");
  }));
}
function setupCopyButtons() {
  document.querySelectorAll(".copy-install-snippet-btn").forEach((b) => b.addEventListener("click", () => {
    const el = document.getElementById(b.dataset.target);
    if (el) copyText(el.textContent, "Copied");
    const o = b.textContent; b.textContent = "Copied"; setTimeout(() => { b.textContent = o; }, 1600);
  }));
}
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const o = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", o ? "true" : "false");
    document.body.style.overflow = o ? "hidden" : "";
  });
}
document.addEventListener("DOMContentLoaded", loadProject);
