/* Catalog controller. */
let APPS = [];
let RELEASES = {};
let currentFilter = "all";
let searchQuery = "";
const SOLID = { opengmaps: "#007aff", ohemacs: "#1d1d1f", whatisit: "#12805c", opentwit: "#5856d6" };
const GLYPH = { opengmaps: "G", ohemacs: "E", whatisit: "W", opentwit: "T" };

const catalogGrid = document.getElementById("catalogGrid");
const searchInput = document.getElementById("catalogSearchInput");
const searchClear = document.getElementById("catalogSearchClear");
const filterPills = document.getElementById("catalogFilterPills");
const emptyState = document.getElementById("catalogEmptyState");
const resetBtn = document.getElementById("catalogResetBtn");
const toast = document.getElementById("toast");

function showToast(m) {
  if (!toast) return;
  toast.textContent = m; toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}
function escapeHTML(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderCatalog() {
  if (!catalogGrid) return;
  const q = searchQuery.trim().toLowerCase();
  const list = APPS.filter((app) => {
    const tags = [...(app.stack || []), ...(app.filterTags || [])].map((s) => s.toLowerCase());
    if (currentFilter !== "all" && !tags.includes(currentFilter.toLowerCase())) return false;
    if (!q) return true;
    const hay = [app.name, app.tagline, app.category, app.description, app.api, app.bundle, ...(app.stack || [])].join(" ").toLowerCase();
    return q.split(/\s+/).every((t) => hay.includes(t));
  });
  if (!list.length) { catalogGrid.innerHTML = ""; if (emptyState) emptyState.classList.remove("hidden"); return; }
  if (emptyState) emptyState.classList.add("hidden");
  catalogGrid.innerHTML = list.map((app) => {
    const rel = RELEASES[app.id];
    let badge = "";
    if (rel && rel.assets && rel.assets.length) {
      const hap = rel.assets.find((a) => a.type === "hap");
      if (hap && rel.tagName) badge = '<span class="card-release-tag">' + escapeHTML(rel.tagName) + " · " + escapeHTML(hap.formattedSize) + "</span>";
      else if (rel.tagName) badge = '<span class="card-release-tag">' + escapeHTML(rel.tagName) + "</span>";
    }
    const solid = SOLID[app.id] || "#1d1d1f";
    const glyph = GLYPH[app.id] || "A";
    const stack = (app.stack || []).slice(0, 3);
    return '<article class="port-card catalog-card"><div class="card-top"><div class="card-glyph-box" style="background:' + solid + '">' + glyph + '</div><div class="card-header-tags">' + badge +
      '<div class="card-status-badge ' + (app.statusClass === "is-wip" ? "warn" : "ok") + '"><span class="badge-dot"></span><span>' + escapeHTML(app.status) + "</span></div></div></div>" +
      "<h3 class='card-title'>" + escapeHTML(app.name) + "</h3><p class='card-tagline'>" + escapeHTML(app.tagline) + "</p><p class='card-desc'>" + escapeHTML(app.description) + "</p>" +
      '<div class="card-features">' + stack.map((s) => '<span class="card-feature-pill">' + escapeHTML(s) + "</span>").join("") + "</div>" +
      '<div class="card-footer"><a class="btn-open-dossier" href="/apps/' + app.id + '"><span>Open project</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg></a>' +
      '<a class="card-repo-link" href="' + app.repo + '" target="_blank" rel="noopener"><span>Source</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></a></div></article>';
  }).join("");
}
if (searchInput) searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  if (searchClear) searchClear.classList.toggle("hidden", !searchQuery);
  renderCatalog();
});
if (searchClear) searchClear.addEventListener("click", () => {
  searchQuery = ""; if (searchInput) searchInput.value = "";
  searchClear.classList.add("hidden"); renderCatalog();
});
if (filterPills) filterPills.addEventListener("click", (e) => {
  const p = e.target.closest(".filter-pill"); if (!p) return;
  filterPills.querySelectorAll(".filter-pill").forEach((x) => x.classList.remove("active"));
  p.classList.add("active"); currentFilter = p.dataset.stack; renderCatalog();
});
if (resetBtn) resetBtn.addEventListener("click", () => {
  searchQuery = ""; currentFilter = "all";
  if (searchInput) searchInput.value = "";
  if (searchClear) searchClear.classList.add("hidden");
  if (filterPills) filterPills.querySelectorAll(".filter-pill").forEach((p) => p.classList.toggle("active", p.dataset.stack === "all"));
  renderCatalog();
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]"); if (!b) return;
  const t = b.dataset.copy;
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => showToast("Install command copied"));
  b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1600);
});
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const o = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", o ? "true" : "false");
    document.body.style.overflow = o ? "hidden" : "";
  });
}
async function initCatalog() {
  try {
    const [a, r] = await Promise.all([fetch("/api/apps"), fetch("/api/releases")]);
    APPS = await a.json(); RELEASES = r.ok ? await r.json() : {};
    renderCatalog();
  } catch (e) { console.error(e); }
}
document.addEventListener("DOMContentLoaded", initCatalog);
