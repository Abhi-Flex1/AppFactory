/* AppFactory — home controller. Solid accents, sheet modal, drawer nav. */
let APPS = [];
let CONTRIBUTORS = [];
let activeAppId = "opengmaps";
let currentFilter = "all";
let searchQuery = "";
let lastFocusedElement = null;

const SOLID = { opengmaps: "#007aff", ohemacs: "#1d1d1f", whatisit: "#12805c", opentwit: "#5856d6" };
const GLYPH = { opengmaps: "G", ohemacs: "E", whatisit: "W", opentwit: "T" };

const portsGrid = document.getElementById("portsGrid");
const buildersGrid = document.getElementById("buildersGrid");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const filterPills = document.getElementById("filterPills");
const emptyState = document.getElementById("emptyState");
const apiErrorBanner = document.getElementById("apiErrorBanner");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const toast = document.getElementById("toast");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

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
const copyCliBtn = document.getElementById("copyCliBtn");

let toastTimeout;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("hidden"), 2400);
}
function copyToClipboard(text, msg) {
  msg = msg || "Copied";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => fallbackCopy(text, msg));
  } else fallbackCopy(text, msg);
}
function fallbackCopy(text, msg) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); showToast(msg); } catch (e) { showToast("Copy failed"); }
  document.body.removeChild(ta);
}
function escapeHTML(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function solidFor(app) { return SOLID[app.id] || "#1d1d1f"; }
function glyphFor(app) { return GLYPH[app.id] || (app.glyph && app.glyph.length === 1 ? app.glyph : "A"); }

const PATTERN_MAP = {
  opengmaps: "Flutter backport shim",
  ohemacs: "ArkTS shell + NAPI bridge",
  whatisit: "Companion server (Go + ArkTS)",
  opentwit: "Native ArkTS client"
};

function selectStageApp(appId) {
  activeAppId = appId;
  const app = APPS.find((a) => a.id === appId);
  stageTabs.forEach((tab) => {
    const on = tab.dataset.app === appId;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
  });
  document.querySelectorAll(".device-mockup").forEach((m) => {
    m.classList.toggle("active", m.id === "mockup-" + appId);
  });
  if (!app) return;
  if (infoTitle) infoTitle.textContent = app.name;
  if (infoTagline) infoTagline.textContent = app.tagline;
  if (infoDesc) infoDesc.textContent = app.description;
  if (infoStatus) infoStatus.textContent = app.status;
  if (infoTarget) infoTarget.textContent = app.api;
  if (infoBundle) infoBundle.textContent = app.bundle;
  if (infoPattern) infoPattern.textContent = PATTERN_MAP[app.id] || "Native port";
  if (infoStack) infoStack.textContent = (app.stack || []).join(" · ");
  if (infoDossierBtn) infoDossierBtn.dataset.open = app.id;
  if (infoProjectLink) infoProjectLink.href = "/apps/" + app.id;
  if (infoRepoLink) infoRepoLink.href = app.repo;
}
stageTabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectStageApp(tab.dataset.app));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = stageTabs[(i + dir + stageTabs.length) % stageTabs.length];
    next.focus(); selectStageApp(next.dataset.app);
  });
});
if (infoDossierBtn) infoDossierBtn.addEventListener("click", () => openModal(infoDossierBtn.dataset.open));

function renderPorts() {
  if (!portsGrid) return;
  const query = searchQuery.trim().toLowerCase();
  const filtered = APPS.filter((app) => {
    const tags = [...(app.stack || []), ...(app.filterTags || [])].map((s) => s.toLowerCase());
    if (currentFilter !== "all" && !tags.includes(currentFilter.toLowerCase())) return false;
    if (!query) return true;
    const hay = [app.name, app.tagline, app.category, app.description, app.api, app.bundle, ...(app.stack || [])].join(" ").toLowerCase();
    return query.split(/\s+/).every((t) => hay.includes(t));
  });
  if (!filtered.length) {
    portsGrid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");
  portsGrid.innerHTML = filtered.map((app) => {
    const tone = app.statusClass === "is-wip" ? "warn" : "ok";
    const stack = (app.stack || []).slice(0, 3);
    return (
      '<article class="port-card" data-id="' + app.id + '">' +
      '<div class="card-top"><div class="card-glyph-box" style="background:' + solidFor(app) + '">' + escapeHTML(glyphFor(app)) + '</div>' +
      '<div class="card-status-badge ' + tone + '"><span class="badge-dot"></span><span>' + escapeHTML(app.status) + "</span></div></div>" +
      "<h3 class='card-title'>" + escapeHTML(app.name) + "</h3>" +
      "<p class='card-tagline'>" + escapeHTML(app.tagline) + "</p>" +
      "<p class='card-desc'>" + escapeHTML(app.description) + "</p>" +
      '<div class="card-features">' + stack.map((s) => '<span class="card-feature-pill">' + escapeHTML(s) + "</span>").join("") + "</div>" +
      '<div class="card-footer"><a class="btn-open-dossier" href="/apps/' + app.id + '"><span>Open project</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg></a>' +
      '<a class="card-repo-link" href="' + app.repo + '" target="_blank" rel="noopener"><span>Source</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></a></div>' +
      "</article>"
    );
  }).join("");
}

if (searchInput) searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  if (searchClear) searchClear.classList.toggle("hidden", !searchQuery);
  renderPorts();
});
if (searchClear) searchClear.addEventListener("click", () => {
  searchQuery = ""; if (searchInput) searchInput.value = "";
  searchClear.classList.add("hidden"); renderPorts(); if (searchInput) searchInput.focus();
});
if (filterPills) filterPills.addEventListener("click", (e) => {
  const pill = e.target.closest(".filter-pill"); if (!pill) return;
  filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
  pill.classList.add("active"); currentFilter = pill.dataset.stack; renderPorts();
});
if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", () => {
  searchQuery = ""; currentFilter = "all";
  if (searchInput) searchInput.value = "";
  if (searchClear) searchClear.classList.add("hidden");
  if (filterPills) filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.toggle("active", p.dataset.stack === "all"));
  renderPorts();
});
document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  if (openBtn) { openModal(openBtn.dataset.open); return; }
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    copyToClipboard(copyBtn.dataset.copy, "Install command copied");
    const old = copyBtn.textContent; copyBtn.textContent = "Copied";
    setTimeout(() => { copyBtn.textContent = old; }, 1600);
  }
});

function renderBuilders() {
  if (!buildersGrid) return;
  buildersGrid.innerHTML = CONTRIBUTORS.map((p) => {
    const initial = (p.name || "A").charAt(0).toUpperCase();
    return (
      '<article class="builder-card"><div class="builder-avatar-wrap">' +
      '<img class="builder-avatar" src="' + p.avatar + '" alt="' + escapeHTML(p.name) + '" width="64" height="64" loading="lazy" onerror="this.style.display=\'none\';this.parentNode.insertAdjacentHTML(\'afterbegin\',\'<span class=&quot;builder-avatar&quot; aria-hidden=&quot;true&quot;>' + initial + '</span>\')" />' +
      '<span class="builder-verified-badge" title="Maintainer">✓</span></div>' +
      '<div class="builder-content"><h3 class="builder-name">' + escapeHTML(p.name) + '</h3><p class="builder-role">' + escapeHTML(p.role) + "</p>" +
      '<div class="builder-focus-list">' + (p.focus || []).map((f) => '<span class="builder-focus-pill">' + escapeHTML(f) + "</span>").join("") + "</div>" +
      '<div class="builder-socials"><a class="social-link" href="' + p.github + '" target="_blank" rel="noopener">GitHub</a>' +
      '<a class="social-link" href="' + p.twitter + '" target="_blank" rel="noopener">' + escapeHTML(p.twitterHandle || "X") + "</a></div></div></article>"
    );
  }).join("");
}

function openModal(appId) {
  const app = APPS.find((a) => a.id === appId);
  if (!app || !modalBackdrop) return;
  lastFocusedElement = document.activeElement;
  if (modalGlyph) { modalGlyph.textContent = glyphFor(app); modalGlyph.style.background = solidFor(app); }
  if (modalStatusBadge) modalStatusBadge.textContent = app.status;
  if (modalTitle) modalTitle.textContent = app.name;
  if (modalTagline) modalTagline.textContent = app.tagline;
  if (modalDesc) modalDesc.textContent = app.description;
  if (modalSpecGrid) modalSpecGrid.innerHTML =
    '<div class="spec-item"><div class="spec-label">Target</div><div class="spec-val">' + escapeHTML(app.api) + '</div></div>' +
    '<div class="spec-item"><div class="spec-label">Bundle</div><div class="spec-val font-mono">' + escapeHTML(app.bundle) + '</div></div>' +
    '<div class="spec-item"><div class="spec-label">License</div><div class="spec-val">' + escapeHTML(app.license) + '</div></div>' +
    '<div class="spec-item"><div class="spec-label">Stack</div><div class="spec-val">' + escapeHTML((app.stack || []).join(" · ")) + "</div></div>";
  if (modalFeatures) modalFeatures.innerHTML = (app.features || []).map((f) => "<li>" + escapeHTML(f) + "</li>").join("");
  if (modalPorting) modalPorting.innerHTML = (app.porting || []).map((p) => "<li>" + escapeHTML(p) + "</li>").join("");
  if (modalInstall) modalInstall.textContent = app.install || "";
  if (modalCopyInstallBtn) modalCopyInstallBtn.onclick = () => copyToClipboard(app.install, "Install command copied");
  if (modalMaintainers) {
    const makers = (app.maintainers || []).map((mid) => CONTRIBUTORS.find((c) => c.id === mid) || { name: mid });
    modalMaintainers.innerHTML = makers.map((m) => '<span class="maintainer-chip">' + escapeHTML(m.name) + "</span>").join("");
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
  if (lastFocusedElement && lastFocusedElement.focus) lastFocusedElement.focus();
}
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalBackdrop) modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modalBackdrop && !modalBackdrop.classList.contains("hidden")) closeModal();
    if (navMenu && navMenu.classList.contains("open")) { navMenu.classList.remove("open"); if (menuToggle) menuToggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
  }
});

if (copyCliBtn) copyCliBtn.addEventListener("click", () => {
  copyToClipboard("git clone https://github.com/Abhi-Flex1/AppFactory.git && cd AppFactory && npm install && npm start", "Quickstart copied");
  const label = copyCliBtn.querySelector(".copy-label");
  if (label) { const o = label.textContent; label.textContent = "Copied"; setTimeout(() => { label.textContent = o; }, 1600); }
});

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  navMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-item")) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

async function initApp() {
  try {
    const [appsRes, contribRes] = await Promise.all([fetch("/api/apps"), fetch("/api/contributors")]);
    if (!appsRes.ok) throw new Error("apps fetch failed");
    APPS = await appsRes.json();
    CONTRIBUTORS = contribRes.ok ? await contribRes.json() : [];
    if (apiErrorBanner) apiErrorBanner.classList.add("hidden");
    const params = new URLSearchParams(location.search);
    const wanted = params.get("app");
    selectStageApp(APPS.some((a) => a.id === wanted) ? wanted : "opengmaps");
    renderPorts(); renderBuilders();
  } catch (err) {
    console.error(err);
    if (apiErrorBanner) apiErrorBanner.classList.remove("hidden");
  }
}
initApp();
