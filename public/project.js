/**
 * AppFactory — Dedicated Project Page Controller
 * Handles live GitHub Releases download links, interactive tab switching,
 * code copying, and mockups.
 */

// Determine current app ID from URL (/apps/opengmaps or ?id=opengmaps)
function getAppIdFromURL() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "apps" && pathParts[1]) {
    return pathParts[1].toLowerCase();
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("id")) {
    return params.get("id").toLowerCase();
  }
  return "opengmaps"; // Default fallback
}

const currentAppId = getAppIdFromURL();

// Toast helper
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function copyText(text, successMsg = "Copied to clipboard!") {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => execCommandCopy(text, successMsg));
  } else {
    execCommandCopy(text, successMsg);
  }
}

function execCommandCopy(text, successMsg) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand("copy");
    showToast(successMsg);
  } catch {
    showToast("Press Ctrl+C to copy");
  }
  document.body.removeChild(el);
}

// Interactive stage mockups dictionary
const MOCKUPS = {
  opengmaps: `
    <div class="device-mockup phone-mockup active">
      <div class="phone-frame">
        <div class="phone-island"><span class="island-camera"></span></div>
        <div class="phone-screen screen-map">
          <div class="map-bg">
            <div class="map-water"></div>
            <div class="map-park"></div>
            <div class="map-highway"></div>
            <div class="map-road-1"></div>
            <div class="map-road-2"></div>
            <svg class="map-polyline" viewBox="0 0 280 460" preserveAspectRatio="none">
              <path d="M 50 380 Q 90 320 80 260 T 170 190 T 220 90" fill="none" stroke="#0A59F7" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 10" />
              <circle cx="50" cy="380" r="7" fill="#0A59F7" stroke="#ffffff" stroke-width="2.5" />
              <circle cx="220" cy="90" r="7" fill="#E11D48" stroke="#ffffff" stroke-width="2.5" />
            </svg>
          </div>
          <div class="map-search-bar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Search destination or POI...</span>
          </div>
          <div class="map-turn-card">
            <div class="turn-icon">⮡</div>
            <div class="turn-info">
              <div class="turn-dist">In 300 m</div>
              <div class="turn-street">Turn right on Harmony Blvd</div>
            </div>
          </div>
          <div class="map-eta-card">
            <div class="eta-time">18 min</div>
            <div class="eta-details">7.4 km · 15:42 ETA · Fastest route</div>
          </div>
        </div>
      </div>
    </div>
  `,
  ohemacs: `
    <div class="device-mockup tablet-mockup active">
      <div class="tablet-frame">
        <div class="window-titlebar">
          <div class="window-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="window-title">OHEmacs — GNU Emacs 30.1 [Stage Model]</div>
          <div class="window-badge">API 24</div>
        </div>
        <div class="window-screen screen-term">
          <div class="term-tabs">
            <span class="term-tab active">*scratch*</span>
            <span class="term-tab">ohos-surface.c</span>
            <span class="term-tab">init.el</span>
          </div>
          <div class="term-code">
            <p><span class="c-comment">;; GNU Emacs 30.1 — Stage-model HAP on HarmonyOS 6.1</span></p>
            <p><span class="c-comment">;; XComponent EGL surface + NAPI event loop bridge</span></p>
            <p><br /></p>
            <p><span class="c-keyword">(defun</span> <span class="c-fn">ohos-init-frame</span> ()</p>
            <p>&nbsp;&nbsp;<span class="c-keyword">(interactive)</span></p>
            <p>&nbsp;&nbsp;<span class="c-keyword">(message</span> <span class="c-string">"HarmonyOS XComponent surface initialized: %s"</span></p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-var">(napi-get-surface-dimensions)</span>))</p>
            <p><br /></p>
            <p><span class="c-keyword">(when</span> <span class="c-var">ohos-touch-events-available-p</span></p>
            <p>&nbsp;&nbsp;<span class="c-keyword">(enable-touch-scroll</span> <span class="c-const">:momentum</span> <span class="c-keyword">t</span>))</p>
          </div>
          <div class="term-modeline">
            <span class="mod-status">-UUU:---F1</span>
            <span class="mod-name">*scratch*</span>
            <span class="mod-info">(Lisp Interaction) [EGL HW Accelerated]</span>
          </div>
        </div>
      </div>
    </div>
  `,
  whatisit: `
    <div class="device-mockup phone-mockup active">
      <div class="phone-frame">
        <div class="phone-island"><span class="island-camera"></span></div>
        <div class="phone-screen screen-chat">
          <div class="chat-header">
            <div class="chat-avatar">W</div>
            <div class="chat-meta">
              <div class="chat-name">HarmonyOS Builders</div>
              <div class="chat-sub">online · end-to-end encrypted</div>
            </div>
            <div class="chat-icons">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/></svg>
            </div>
          </div>
          <div class="chat-messages">
            <div class="chat-date">Today</div>
            <div class="bubble bubble-them">
              <p>QR code paired with Go companion server. Multi-Device session active.</p>
              <span class="bubble-time">15:20</span>
            </div>
            <div class="bubble bubble-me">
              <p>History synchronized: 4,154 messages and channels indexed locally!</p>
              <span class="bubble-time">15:21 <span class="ticks">✓✓</span></span>
            </div>
            <div class="bubble bubble-them">
              <p>Testing voice call via meowcaller audio pipeline...</p>
              <span class="bubble-time">15:22</span>
            </div>
          </div>
          <div class="chat-input-bar">
            <span class="chat-input-placeholder">Type a message...</span>
            <div class="chat-send-btn">➔</div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Architecture diagrams & specs
const ARCH_DETAILS = {
  opengmaps: {
    patternTitle: "Pattern 01: Flutter Backport Shim",
    patternSub: "Shim upstream google_maps_flutter platform interface onto an in-app ArkWeb JavaScript runtime and native Location Kit.",
    diagram: `
      <div class="pattern-flow">
        <div class="flow-step">google_maps_flutter (Stock Plugin API)</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step highlight">google_maps_flutter_ohos (Platform Interface)</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step">ArkWeb WebView Bridge + Maps JS API 3.56</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step highlight">OHOS Location Kit (Native GPS / Cell)</div>
      </div>
    `,
    points: [
      "Zero binary GMS dependency: renders official vector tiles via ArkWeb without Google Play Services.",
      "Debounced Places Autocomplete + Place details query pipeline over HTTP.",
      "Custom native method channel (io.opengmaps/location) querying Location Kit.",
      "Permissions: ohos.permission.INTERNET, LOCATION, APPROXIMATELY_LOCATION."
    ]
  },
  ohemacs: {
    patternTitle: "Pattern 02: Native ArkTS Shell + NAPI C Bridge",
    patternSub: "Host GNU Emacs 30.1 inside a Stage-model HAP using an XComponent EGL surface for hardware-accelerated rendering.",
    diagram: `
      <div class="pattern-flow">
        <div class="flow-step">ArkUI Stage-Model Window (EntryAbility)</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step highlight">XComponent EGL Surface (OpenGL ES 3.0)</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step">NAPI libentry.so (Thread-safe POSIX Event Loop)</div>
        <div class="flow-arrow">↓</div>
        <div class="flow-step highlight">GNU Emacs 30.1 Core Engine + Lisp VM</div>
      </div>
    `,
    points: [
      "XComponent mounts a hardware-accelerated EGL rendering context direct to the GPU.",
      "Thread-safe dual-write event queue passes touches, key events, and resize buffers to the C engine.",
      "Cross-compiled with OpenHarmony LLVM NDK (aarch64-unknown-linux-ohos, musl libc).",
      "Includes standalone CLI binary (/data/local/tmp/emacs) with full --batch and -nw support."
    ]
  },
  whatisit: {
    patternTitle: "Pattern 03: Companion Server Bridge",
    patternSub: "Isolate cryptographic Multi-Device WhatsApp protocol state in an always-on Go daemon, serving a native ArkTS mobile client.",
    diagram: `
      <div class="pattern-flow">
        <div class="flow-step">ArkUI Mobile Client (ArkTS + CdpBridge)</div>
        <div class="flow-arrow">↕ (Local WebSocket / HTTP REST)</div>
        <div class="flow-step highlight">Go Companion Server (whatsmeow daemon)</div>
        <div class="flow-arrow">↕ (E2E Encrypted Protocol)</div>
        <div class="flow-step">WhatsApp Multi-Device Cloud Servers</div>
      </div>
    `,
    points: [
      "Pair once via in-app QR code or 8-character phone code with zero browser dependencies.",
      "Go daemon (server-go) manages SQLite session database, message index, and keepalive heartbeats.",
      "ArkTS client connects via real-time WebSocket push for instant notifications.",
      "Voice/video calling experimental via meowcaller audio pipeline integration."
    ]
  }
};

// Main Loader
async function loadProject() {
  try {
    const [appsRes, relRes, contribRes] = await Promise.all([
      fetch("/api/apps"),
      fetch(`/api/releases/${currentAppId}`),
      fetch("/api/contributors")
    ]);

    const apps = await appsRes.json();
    const app = apps.find((a) => a.id === currentAppId) || apps[0];
    const release = relRes.ok ? await relRes.json() : null;
    const contributors = contribRes.ok ? await contribRes.json() : [];

    // Document Title
    document.title = `${app.name} — HarmonyOS NEXT Port | AppFactory`;

    // Breadcrumb
    const breadName = document.getElementById("breadProjectName");
    if (breadName) breadName.textContent = app.name;

    // Project Hero
    const glyphBox = document.getElementById("projectGlyph");
    if (glyphBox) {
      glyphBox.textContent = app.glyph || "◈";
      glyphBox.style.background = app.accent || "var(--accent-primary)";
    }
    const nameEl = document.getElementById("projectName");
    if (nameEl) nameEl.textContent = app.name;

    const tagEl = document.getElementById("projectTagline");
    if (tagEl) tagEl.textContent = app.tagline;

    const descEl = document.getElementById("projectDesc");
    if (descEl) descEl.textContent = app.description;

    const statusEl = document.getElementById("projectStatus");
    if (statusEl) statusEl.textContent = app.status;

    const catEl = document.getElementById("projectCategory");
    if (catEl) catEl.textContent = app.category;

    // Specs
    const targetEl = document.getElementById("specTarget");
    if (targetEl) targetEl.textContent = app.api;

    const bundleEl = document.getElementById("specBundle");
    if (bundleEl) bundleEl.textContent = app.bundle;

    const licEl = document.getElementById("specLicense");
    if (licEl) licEl.textContent = app.license;

    const stackEl = document.getElementById("specStack");
    if (stackEl) stackEl.textContent = (app.stack || []).join(", ");

    // Hero buttons
    const heroRepoBtn = document.getElementById("heroRepoBtn");
    if (heroRepoBtn) heroRepoBtn.href = app.repo;

    const heroCopyBtn = document.getElementById("heroCopyInstallBtn");
    if (heroCopyBtn) {
      heroCopyBtn.onclick = () => copyText(app.install, "Install command copied!");
    }

    // Hero Download Button
    const heroDownloadBtn = document.getElementById("heroDownloadBtn");
    const heroDownloadLabel = document.getElementById("heroDownloadLabel");
    if (release && release.assets && release.assets.length > 0) {
      const primaryAsset = release.assets.find((a) => a.type === "hap") || release.assets[0];
      if (heroDownloadBtn && primaryAsset) {
        heroDownloadBtn.href = primaryAsset.downloadUrl;
        heroDownloadBtn.setAttribute("download", primaryAsset.name);
        if (heroDownloadLabel) {
          heroDownloadLabel.textContent = `Download ${primaryAsset.name} (${primaryAsset.formattedSize})`;
        }
      }
    } else {
      if (heroDownloadBtn) heroDownloadBtn.href = app.repo;
      if (heroDownloadLabel) heroDownloadLabel.textContent = "View Repository Source";
    }

    // Render Tab 1: Downloads & GitHub Releases
    renderDownloads(app, release);

    // Render Tab 2: Interactive Preview
    renderPreview(app, contributors);

    // Render Tab 3: Architecture
    renderArchitecture(app);

    // Render Tab 4: Installation
    renderInstallation(app, release);

    // Render Other Ports
    renderOtherPorts(apps, app.id);

    // Disclaimer
    const disEl = document.getElementById("projectDisclaimerText");
    if (disEl) disEl.textContent = app.disclaimer || "Open source project.";

    // Setup Tabs
    setupTabs();
    setupCopyButtons();
  } catch (err) {
    console.error("Failed to load project details:", err);
  }
}

// Render Tab 1: Downloads
function renderDownloads(app, release) {
  const titleEl = document.getElementById("relTitle");
  const metaEl = document.getElementById("relMeta");
  const tagEl = document.getElementById("relTag");
  const gridEl = document.getElementById("releaseAssetsGrid");
  const ghLink = document.getElementById("relGhLink");
  const bodyEl = document.getElementById("relBody");

  if (!release || !release.assets || release.assets.length === 0) {
    if (titleEl) titleEl.textContent = `${app.name} Builds & Source`;
    if (metaEl) metaEl.textContent = "Automated release binaries pending. Source code and companion modules are buildable.";
    if (tagEl) tagEl.textContent = "main";
    if (ghLink) ghLink.href = app.repo;
    if (bodyEl) bodyEl.textContent = "Pre-release development build. Please build from source using the instructions in the Installation Guide tab.";

    if (gridEl) {
      gridEl.innerHTML = `
        <div class="asset-card">
          <div class="asset-icon hap">📦</div>
          <div class="asset-info">
            <h4 class="asset-name">Repository Source Code</h4>
            <span class="asset-size">ZIP Archive</span>
            <p class="asset-hint">Download the latest tree directly from GitHub</p>
          </div>
          <a class="btn-download-asset" href="${app.repo}/archive/refs/heads/main.zip" target="_blank" rel="noopener">
            <span>Download ZIP</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </a>
        </div>
      `;
    }
    return;
  }

  if (titleEl) titleEl.textContent = release.name || `${app.name} ${release.tagName}`;
  const pubDate = release.publishedAt ? new Date(release.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
  if (metaEl) metaEl.textContent = `Published on ${pubDate} · Pulled directly from official GitHub Releases`;
  if (tagEl) tagEl.textContent = release.tagName;
  if (ghLink) ghLink.href = release.htmlUrl || `${app.repo}/releases`;
  if (bodyEl) bodyEl.textContent = release.body || "No additional release notes provided.";

  if (gridEl) {
    gridEl.innerHTML = release.assets.map((asset) => {
      const isHap = asset.type === "hap";
      const iconClass = isHap ? "hap" : (asset.type === "binary" ? "bin" : "zip");
      const iconGlyph = isHap ? "⚡" : (asset.type === "binary" ? "⚙" : "📦");
      const primaryBadge = isHap ? `<span class="badge-primary-asset">Device Package</span>` : "";

      return `
        <div class="asset-card ${isHap ? 'featured-asset' : ''}">
          <div class="asset-header-row">
            <div class="asset-icon ${iconClass}">${iconGlyph}</div>
            <div class="asset-badges">
              ${primaryBadge}
              <span class="asset-size-pill">${asset.formattedSize}</span>
            </div>
          </div>
          <div class="asset-info">
            <h4 class="asset-name font-mono">${asset.name}</h4>
            <p class="asset-label">${asset.label || ''}</p>
            ${asset.installHint ? `<code class="asset-install-hint">$ ${asset.installHint}</code>` : ''}
          </div>
          <div class="asset-actions">
            <a class="btn-download-asset ${isHap ? 'primary' : ''}" href="${asset.downloadUrl}" target="_blank" rel="noopener" download="${asset.name}">
              <span>Download</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            ${asset.installHint ? `<button class="btn-copy-install-hint" data-hint="${asset.installHint}">Copy HDC Command</button>` : ''}
          </div>
        </div>
      `;
    }).join("");

    // Wire up hint buttons
    gridEl.querySelectorAll(".btn-copy-install-hint").forEach((btn) => {
      btn.addEventListener("click", () => {
        copyText(btn.dataset.hint, "HDC command copied!");
      });
    });
  }
}

// Render Tab 2: Preview
function renderPreview(app, contributors) {
  const mockupSlot = document.getElementById("previewMockupSlot");
  if (mockupSlot) {
    mockupSlot.innerHTML = MOCKUPS[app.id] || MOCKUPS.opengmaps;
  }

  const featuresList = document.getElementById("previewFeaturesList");
  if (featuresList) {
    featuresList.innerHTML = (app.features || []).map((f) => `
      <li>
        <span class="chk">✓</span>
        <span>${f}</span>
      </li>
    `).join("");
  }

  const maintainersList = document.getElementById("previewMaintainersList");
  if (maintainersList) {
    const makers = (app.maintainers || []).map((mid) => contributors.find((c) => c.id === mid) || { name: mid, github: `https://github.com/${mid}` });
    maintainersList.innerHTML = makers.map((m) => `
      <div class="maintainer-card-mini">
        <div class="m-avatar">${m.name.charAt(0)}</div>
        <div class="m-meta">
          <strong>${m.name}</strong>
          <span>${m.role || 'Port Engineer'}</span>
        </div>
        <a class="m-link" href="${m.github}" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    `).join("");
  }
}

// Render Tab 3: Architecture
function renderArchitecture(app) {
  const arch = ARCH_DETAILS[app.id] || ARCH_DETAILS.opengmaps;
  const titleEl = document.getElementById("archPatternTitle");
  const subEl = document.getElementById("archPatternSub");
  const diagramEl = document.getElementById("archFlowDiagram");
  const pointsList = document.getElementById("archPointsList");

  if (titleEl) titleEl.textContent = arch.patternTitle;
  if (subEl) subEl.textContent = arch.patternSub;
  if (diagramEl) diagramEl.innerHTML = arch.diagram;

  if (pointsList) {
    pointsList.innerHTML = arch.points.map((pt) => `<li>${pt}</li>`).join("");
  }
}

// Render Tab 4: Installation Guide
function renderInstallation(app, release) {
  const hdcCode = document.getElementById("installHdcCode");
  const buildCode = document.getElementById("installBuildCode");

  let prebuiltHapName = `${app.id}.hap`;
  if (release && release.assets) {
    const hapAsset = release.assets.find((a) => a.type === "hap");
    if (hapAsset) prebuiltHapName = hapAsset.name;
  }

  if (hdcCode) {
    hdcCode.textContent = `# 1. Download ${prebuiltHapName} from Downloads tab\n# 2. Connect device or launch emulator:\nhdc list targets\n# 3. Install to device:\nhdc install ${prebuiltHapName}\n# 4. Launch ability:\nhdc shell aa start -a EntryAbility -b ${app.bundle}`;
  }

  if (buildCode) {
    buildCode.textContent = app.install || "git clone " + app.repo;
  }
}

// Render Other Ports List
function renderOtherPorts(apps, currentId) {
  const grid = document.getElementById("otherPortsGrid");
  if (!grid) return;

  const others = apps.filter((a) => a.id !== currentId);
  grid.innerHTML = others.map((app) => `
    <a href="/apps/${app.id}" class="other-port-card">
      <div class="other-glyph" style="background: ${app.accent || 'var(--accent-primary)'};">${app.glyph}</div>
      <div class="other-info">
        <span class="other-name">${app.name}</span>
        <span class="other-tagline">${app.tagline}</span>
      </div>
      <span class="other-arrow">➔</span>
    </a>
  `).join("");
}

// Tab Switching Interaction
function setupTabs() {
  const tabBtns = document.querySelectorAll(".project-tab-btn");
  const panes = document.querySelectorAll(".project-tab-pane");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPaneId = "pane-" + btn.dataset.pane;

      tabBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      panes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const activePane = document.getElementById(targetPaneId);
      if (activePane) activePane.classList.add("active");
    });
  });
}

// Snippet copy buttons
function setupCopyButtons() {
  document.querySelectorAll(".copy-install-snippet-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        copyText(targetEl.textContent, "Snippet copied to clipboard!");
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
      }
    });
  });
}

// Mobile Menu
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// Run
document.addEventListener("DOMContentLoaded", loadProject);
