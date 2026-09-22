/* AppFactory — catalogue controller. */
(function () {
  const AF = window.AF;
  const esc = AF.esc;
  const $ = (id) => document.getElementById(id);

  const grid = $("catalogGrid");
  const searchInput = $("searchInput");
  const searchClear = $("searchClear");
  const filterPills = $("filterPills");
  const emptyState = $("emptyState");
  const resetBtn = $("resetBtn");

  let APPS = [];
  let RELEASES = {};
  let activeStack = "all";
  let query = "";

  const chevron =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  function releaseChip(appId) {
    const rel = RELEASES[appId];
    if (!rel) return "";
    const hap = (rel.assets || []).find((a) => a.type === "hap");
    if (!rel.tagName || !hap) return "";
    const size = hap.formattedSize ? " · " + hap.formattedSize : "";
    return '<span class="chip chip--soft">' + esc(rel.tagName + size) + "</span>";
  }

  function cardHTML(app) {
    const stack = (app.stack || []).slice(0, 3);
    return (
      '<article class="port-card">' +
      '<div class="port-card-top">' + AF.appIcon(app, 56) +
      '<div class="port-card-head"><h3 class="port-card-name">' + esc(app.name) + "</h3>" +
      '<p class="port-card-tagline">' + esc(app.tagline) + "</p></div></div>" +
      '<p class="port-card-desc is-clamped">' + esc(app.description) + "</p>" +
      '<div class="port-card-stack">' + AF.statusChip(app) + releaseChip(app.id) +
      stack.map((s) => '<span class="chip chip--mute">' + esc(s) + "</span>").join("") + "</div>" +
      '<div class="port-card-foot">' +
      '<a class="link-arrow" href="/apps/' + app.id + '">Open project' + chevron + "</a>" +
      '<a class="link-quiet" href="' + app.repo + '" target="_blank" rel="noopener">Source</a>' +
      "</div></article>"
    );
  }

  function render() {
    if (!grid) return;
    const q = query.trim().toLowerCase();
    const list = APPS.filter((app) => {
      const tags = [...(app.stack || []), ...(app.filterTags || [])].map((t) => t.toLowerCase());
      if (activeStack !== "all" && !tags.includes(activeStack.toLowerCase())) return false;
      if (!q) return true;
      const hay = [app.name, app.tagline, app.tag, app.category, app.description, app.api, app.bundle, app.status, (app.stack || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => hay.includes(term));
    });
    grid.innerHTML = list.map(cardHTML).join("");
    if (emptyState) emptyState.classList.toggle("is-hidden", list.length > 0);
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value;
      if (searchClear) searchClear.classList.toggle("is-hidden", !query);
      render();
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      query = "";
      if (searchInput) searchInput.value = "";
      searchClear.classList.add("is-hidden");
      render();
    });
  }
  if (filterPills) {
    filterPills.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      activeStack = pill.dataset.stack;
      filterPills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", String(p === pill)));
      render();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      query = "";
      activeStack = "all";
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.add("is-hidden");
      if (filterPills) {
        filterPills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.stack === "all")));
      }
      render();
    });
  }

  AF.wireShell();

  (async function boot() {
    try {
      const [appsRes, relRes] = await Promise.all([fetch("/api/apps"), fetch("/api/releases")]);
      APPS = await appsRes.json();
      RELEASES = relRes.ok ? await relRes.json() : {};
      render();
    } catch (err) {
      console.error(err);
    }
  })();
})();
