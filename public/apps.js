/**
 * AppFactory — Catalog Page Controller
 */

let APPS = [];
let RELEASES = {};
let currentFilter = "all";
let searchQuery = "";

const catalogGrid = document.getElementById("catalogGrid");
const searchInput = document.getElementById("catalogSearchInput");
const searchClear = document.getElementById("catalogSearchClear");
const filterPills = document.getElementById("catalogFilterPills");
const emptyState = document.getElementById("catalogEmptyState");
const resetBtn = document.getElementById("catalogResetBtn");
const toast = document.getElementById("toast");

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast("Command copied to clipboard!"));
  } else {
    showToast("Command copied!");
  }
}

function renderCatalog() {
  if (!catalogGrid) return;

  const query = searchQuery.trim().toLowerCase();
  const filtered = APPS.filter((app) => {
    const matchesStack =
      currentFilter === "all" ||
      [...(app.stack || []), ...(app.filterTags || [])].some(
        (s) => s.toLowerCase() === currentFilter.toLowerCase()
      );
    if (!matchesStack) return false;

    if (!query) return true;
    const hay = [
      app.name,
      app.tagline,
      app.category,
      app.description,
      app.api,
      app.bundle,
      ...(app.stack || [])
    ].join(" ").toLowerCase();

    return query.split(/\s+/).every((term) => hay.includes(term));
  });

  if (filtered.length === 0) {
    catalogGrid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  catalogGrid.innerHTML = filtered.map((app) => {
    const rel = RELEASES[app.id];
    let downloadBadge = "";
    if (rel && rel.assets && rel.assets.length > 0) {
      const hap = rel.assets.find((a) => a.type === "hap");
      if (hap) {
        downloadBadge = `<span class="card-release-tag">⚡ ${rel.tagName} (${hap.formattedSize})</span>`;
      }
    }

    const firstInstallLine = (app.install || "").split("\n")[0] || "git clone " + app.repo;

    return `
      <article class="port-card catalog-card" data-id="${app.id}">
        <div class="card-top">
          <div class="card-glyph-box" style="background: ${app.accent || 'var(--accent-primary)'};">
            ${app.glyph || '◈'}
          </div>
          <div class="card-header-tags">
            ${downloadBadge}
            <div class="card-status-badge ${app.statusClass === 'is-wip' ? 'warn' : 'ok'}">
              <span class="badge-dot"></span>
              <span>${app.status}</span>
            </div>
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

// Event Listeners
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (searchClear) searchClear.classList.toggle("hidden", !searchQuery);
    renderCatalog();
  });
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    searchClear.classList.add("hidden");
    renderCatalog();
  });
}

if (filterPills) {
  filterPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentFilter = pill.dataset.stack;
    renderCatalog();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    searchQuery = "";
    currentFilter = "all";
    if (searchInput) searchInput.value = "";
    if (searchClear) searchClear.classList.add("hidden");
    if (filterPills) {
      filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.toggle("active", p.dataset.stack === "all"));
    }
    renderCatalog();
  });
}

document.addEventListener("click", (e) => {
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    copyText(copyBtn.dataset.copy);
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 2000);
  }
});

// Mobile menu
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

async function initCatalog() {
  try {
    const [appsRes, relRes] = await Promise.all([
      fetch("/api/apps"),
      fetch("/api/releases")
    ]);
    APPS = await appsRes.json();
    RELEASES = relRes.ok ? await relRes.json() : {};
    renderCatalog();
  } catch (err) {
    console.error("Failed to load catalog:", err);
  }
}

document.addEventListener("DOMContentLoaded", initCatalog);
