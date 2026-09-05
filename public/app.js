/**
 * AppFactory Frontend — Apple & Huawei HarmonyOS NEXT Edition
 * Features: Interactive device stage, live search/filtering, copy-to-clipboard,
 * accessible modal sheets, and full builder credits.
 */

// State
let APPS = [];
let CONTRIBUTORS = [];
let activeAppId = "opengmaps";
let currentFilter = "all";
let searchQuery = "";
let lastFocusedElement = null;

// DOM Elements
const portsGrid = document.getElementById("portsGrid");
const buildersGrid = document.getElementById("buildersGrid");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const filterPills = document.getElementById("filterPills");
const emptyState = document.getElementById("emptyState");
const apiErrorBanner = document.getElementById("apiErrorBanner");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const toast = document.getElementById("toast");

// Navigation
const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Stage Elements
const stageTabs = document.querySelectorAll(".stage-tab");
const infoTitle = document.getElementById("info-title");
const infoTagline = document.getElementById("info-tagline");
const infoDesc = document.getElementById("info-desc");
const infoStatus = document.getElementById("info-status");
const infoTarget = document.getElementById("info-target");
const infoBundle = document.getElementById("info-bundle");
const infoPattern = document.getElementById("info-pattern");
const infoStack = document.getElementById("info-stack");
const infoDossierBtn = document.getElementById("info-dossier-btn");
const infoProjectLink = document.getElementById("info-project-link");
const infoRepoLink = document.getElementById("info-repo-link");

// Modal Elements
const modalBackdrop = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalGlyph = document.getElementById("modalGlyph");
const modalStatusBadge = document.getElementById("modalStatusBadge");
const modalTitle = document.getElementById("modalTitle");
const modalTagline = document.getElementById("modalTagline");
const modalSpecGrid = document.getElementById("modalSpecGrid");
const modalDesc = document.getElementById("modalDesc");
const modalFeatures = document.getElementById("modalFeatures");
const modalPorting = document.getElementById("modalPorting");
const modalInstall = document.getElementById("modalInstall");
const modalCopyInstallBtn = document.getElementById("modalCopyInstallBtn");
const modalMaintainers = document.getElementById("modalMaintainers");
const modalRepoLink = document.getElementById("modalRepoLink");
const modalDisclaimer = document.getElementById("modalDisclaimer");

// CLI Copy Button in Dev Section
const copyCliBtn = document.getElementById("copyCliBtn");

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

function copyToClipboard(text, feedbackMsg = "Copied to clipboard!") {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(feedbackMsg)).catch(() => fallbackCopy(text, feedbackMsg));
  } else {
    fallbackCopy(text, feedbackMsg);
  }
}

function fallbackCopy(text, feedbackMsg) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    showToast(feedbackMsg);
  } catch {
    showToast("Press Ctrl+C to copy");
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   Stage Switcher Logic
   ========================================================================== */
const PATTERN_MAP = {
  opengmaps: "Flutter Backport Shim",
  ohemacs: "Native ArkTS Shell + NAPI C Bridge",
  whatisit: "Companion Server Bridge (Go + ArkTS)"
};

function selectStageApp(appId) {
  activeAppId = appId;
  const app = APPS.find((a) => a.id === appId);

  // Update tabs
  stageTabs.forEach((tab) => {
    const isSelected = tab.dataset.app === appId;
    tab.classList.toggle("active", isSelected);
    tab.setAttribute("aria-selected", isSelected ? "true" : "false");
  });

  // Update device frames
  document.querySelectorAll(".device-mockup").forEach((mockup) => {
    mockup.classList.toggle("active", mockup.id === `mockup-${appId}`);
  });

  if (!app) return;

  // Update telemetry info
  if (infoTitle) infoTitle.textContent = app.name;
  if (infoTagline) infoTagline.textContent = app.tagline;
  if (infoDesc) infoDesc.textContent = app.description;
  if (infoStatus) infoStatus.textContent = app.status;
  if (infoTarget) infoTarget.textContent = app.api;
  if (infoBundle) infoBundle.textContent = app.bundle;
  if (infoPattern) infoPattern.textContent = PATTERN_MAP[app.id] || "Native Port";
  if (infoStack) infoStack.textContent = (app.stack || []).join(", ");
  if (infoDossierBtn) infoDossierBtn.dataset.open = app.id;
  if (infoProjectLink) infoProjectLink.href = `/apps/${app.id}`;
  if (infoRepoLink) infoRepoLink.href = app.repo;
}

stageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectStageApp(tab.dataset.app);
  });
});

if (infoDossierBtn) {
  infoDossierBtn.addEventListener("click", () => {
    openModal(infoDossierBtn.dataset.open);
  });
}

/* ==========================================================================
   Render Ports (Bento Grid)
   ========================================================================== */
function renderPorts() {
  if (!portsGrid) return;

  const query = searchQuery.trim().toLowerCase();
  const filtered = APPS.filter((app) => {
    // Stack filter
    const matchesStack =
      currentFilter === "all" ||
      [...(app.stack || []), ...(app.filterTags || [])].some(
        (s) => s.toLowerCase() === currentFilter.toLowerCase()
      );

    if (!matchesStack) return false;

    // Search query
    if (!query) return true;
    const haystack = [
      app.name,
      app.tagline,
      app.category,
      app.description,
      app.api,
      app.bundle,
      ...(app.stack || [])
    ].join(" ").toLowerCase();

    return query.split(/\s+/).every((term) => haystack.includes(term));
  });

  if (filtered.length === 0) {
    portsGrid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  portsGrid.innerHTML = filtered.map((app) => {
    const isWip = app.statusClass === "is-wip";
    const statusTone = isWip ? "warn" : "ok";
    const firstInstallLine = (app.install || "").split("\n")[0] || "git clone " + app.repo;

    return `
      <article class="port-card" data-id="${app.id}">
        <div class="card-top">
          <div class="card-glyph-box" style="background: ${app.accent || 'var(--accent-primary)'};">
            ${app.glyph || '◈'}
          </div>
          <div class="card-status-badge ${statusTone}">
            <span class="badge-dot"></span>
            <span>${app.status}</span>
          </div>
        </div>

        <h3 class="card-title">${app.name}</h3>
        <p class="card-tagline">${app.tagline}</p>
        <p class="card-desc">${app.description}</p>

        <div class="card-features">
          ${(app.stack || []).map((s) => `<span class="card-feature-pill">${s}</span>`).join("")}
          <span class="card-feature-pill">${app.api}</span>
        </div>

        <div class="card-install-box">
          <code class="install-code">$ ${escapeHTML(firstInstallLine)}</code>
          <button class="install-copy-btn" data-copy="${escapeHTML(app.install)}" aria-label="Copy install command">Copy</button>
        </div>

        <div class="card-footer">
          <a class="btn-open-dossier btn-project-link" href="/apps/${app.id}">
            <span>View Project &amp; Downloads</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </a>
          <a class="card-repo-link" href="${app.repo}" target="_blank" rel="noopener">
            <span>Source</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
        </div>
      </article>
    `;
  }).join("");
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ==========================================================================
   Search & Filter Event Listeners
   ========================================================================== */
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (searchClear) searchClear.classList.toggle("hidden", !searchQuery);
    renderPorts();
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    searchClear.classList.add("hidden");
    renderPorts();
  });
}

if (filterPills) {
  filterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentFilter = pill.dataset.stack;
    renderPorts();
  });
}

if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", () => {
    searchQuery = "";
    currentFilter = "all";
    if (searchInput) searchInput.value = "";
    if (searchClear) searchClear.classList.add("hidden");
    if (filterPills) {
      filterPills.querySelectorAll(".filter-pill").forEach((p) => {
        p.classList.toggle("active", p.dataset.stack === "all");
      });
    }
    renderPorts();
  });
}

// Global click handler for open dossier & copy buttons
document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) {
    openModal(openBtn.dataset.open);
    return;
  }

  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    copyToClipboard(copyBtn.dataset.copy, "Install command copied!");
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
  }
});

/* ==========================================================================
   Render Builders Section
   ========================================================================== */
function renderBuilders() {
  if (!buildersGrid) return;

  buildersGrid.innerHTML = CONTRIBUTORS.map((person) => {
    return `
      <article class="builder-card">
        <div class="builder-avatar-wrap">
          <img class="builder-avatar" src="${person.avatar}" alt="${person.name} avatar" onerror="this.onerror=null;this.replaceWith(document.createTextNode('${person.name.charAt(0)}'));" />
          <div class="builder-verified-badge" title="Verified Porting Engineer">✓</div>
        </div>
        <div class="builder-content">
          <h3 class="builder-name">${person.name}</h3>
          <p class="builder-role">${person.role}</p>

          <div class="builder-focus-list">
            ${(person.focus || []).map((f) => `<span class="builder-focus-pill">${f}</span>`).join("")}
          </div>

          <div class="builder-socials">
            <a class="social-link" href="${person.github}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub</span>
            </a>
            <a class="social-link" href="${person.twitter}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>${person.twitterHandle || person.name}</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ==========================================================================
   Detail Dossier Modal
   ========================================================================== */
function openModal(appId) {
  const app = APPS.find((a) => a.id === appId);
  if (!app || !modalBackdrop) return;

  lastFocusedElement = document.activeElement;

  if (modalGlyph) {
    modalGlyph.textContent = app.glyph || "◈";
    modalGlyph.style.background = app.accent || "var(--accent-primary)";
  }
  if (modalStatusBadge) modalStatusBadge.textContent = app.status;
  if (modalTitle) modalTitle.textContent = app.name;
  if (modalTagline) modalTagline.textContent = app.tagline;
  if (modalDesc) modalDesc.textContent = app.description;

  if (modalSpecGrid) {
    modalSpecGrid.innerHTML = `
      <div class="spec-item"><div class="spec-label">Target OS</div><div class="spec-val">${app.api}</div></div>
      <div class="spec-item"><div class="spec-label">Bundle ID</div><div class="spec-val font-mono">${app.bundle}</div></div>
      <div class="spec-item"><div class="spec-label">License</div><div class="spec-val">${app.license}</div></div>
      <div class="spec-item"><div class="spec-label">Stack</div><div class="spec-val">${(app.stack || []).join(", ")}</div></div>
    `;
  }

  if (modalFeatures) {
    modalFeatures.innerHTML = (app.features || []).map((f) => `<li>${f}</li>`).join("");
  }

  if (modalPorting) {
    modalPorting.innerHTML = (app.porting || []).map((p) => `<li>${p}</li>`).join("");
  }

  if (modalInstall) {
    modalInstall.textContent = app.install || "";
  }

  if (modalCopyInstallBtn) {
    modalCopyInstallBtn.onclick = () => {
      copyToClipboard(app.install, "Install command copied!");
      modalCopyInstallBtn.textContent = "Copied!";
      setTimeout(() => { modalCopyInstallBtn.textContent = "Copy"; }, 2000);
    };
  }

  if (modalMaintainers) {
    const makers = (app.maintainers || []).map((mid) => CONTRIBUTORS.find((c) => c.id === mid) || { name: mid });
    modalMaintainers.innerHTML = makers.map((m) => `
      <span class="maintainer-chip">
        <span>👤</span>
        <span>${m.name}</span>
      </span>
    `).join("");
  }

  if (modalRepoLink) modalRepoLink.href = app.repo;
  if (modalDisclaimer) modalDisclaimer.textContent = app.disclaimer || "";

  modalBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  if (modalCloseBtn) modalCloseBtn.focus();
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
  if (lastFocusedElement && lastFocusedElement.focus) {
    lastFocusedElement.focus();
  }
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBackdrop && !modalBackdrop.classList.contains("hidden")) {
    closeModal();
  }
});

/* ==========================================================================
   CLI Snippet Copy in Dev Section
   ========================================================================== */
if (copyCliBtn) {
  copyCliBtn.addEventListener("click", () => {
    const text = "git clone https://github.com/Abhi-Flex1/AppFactory.git && cd AppFactory && npm install && npm start";
    copyToClipboard(text, "Quickstart commands copied!");
    const label = copyCliBtn.querySelector(".copy-label");
    if (label) {
      label.textContent = "Copied!";
      setTimeout(() => { label.textContent = "Copy"; }, 2000);
    }
  });
}

/* ==========================================================================
   Mobile Menu Toggle
   ========================================================================== */
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-item")) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ==========================================================================
   Boot & Data Fetching
   ========================================================================== */
async function initApp() {
  try {
    const [appsRes, contribRes] = await Promise.all([
      fetch("/api/apps"),
      fetch("/api/contributors")
    ]);

    if (!appsRes.ok) throw new Error("Failed to fetch apps");

    APPS = await appsRes.json();
    CONTRIBUTORS = contribRes.ok ? await contribRes.json() : [];

    if (apiErrorBanner) apiErrorBanner.classList.add("hidden");

    // Initialize UI views
    selectStageApp("opengmaps");
    renderPorts();
    renderBuilders();
  } catch (err) {
    console.error("AppFactory initialization error:", err);
    if (apiErrorBanner) apiErrorBanner.classList.remove("hidden");
  }
}

// Start
initApp();

