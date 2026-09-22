/* AppFactory — home controller: device stage, catalogue, patterns, builders. */
(function () {
  const AF = window.AF;
  const esc = AF.esc;

  const $ = (id) => document.getElementById(id);
  const stageTabs = $("stageTabs");
  const stageCanvas = $("stageCanvas");
  const stagePanel = $("stagePanel");
  const portsGrid = $("portsGrid");
  const patternGrid = $("patternGrid");
  const compatBody = $("compatBody");
  const buildersGrid = $("buildersGrid");
  const captureWall = $("captureWall");
  const shotCount = $("shotCount");
  const searchInput = $("searchInput");
  const searchClear = $("searchClear");
  const filterPills = $("filterPills");
  const emptyState = $("emptyState");
  const apiErrorBanner = $("apiErrorBanner");
  const resetFiltersBtn = $("resetFiltersBtn");

  let APPS = [];
  let CONTRIBUTORS = [];
  let SHOTS = {};
  let activeAppId = "opentwit-web";
  let activeStack = "all";
  let query = "";
  let lastFocus = null;

  const byId = (id) => APPS.find((a) => a.id === id);
  const chevron =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  /* ---------- Device stage ---------- */
  function renderStageTabs() {
    if (!stageTabs) return;
    stageTabs.innerHTML = APPS.map((app) => {
      const on = app.id === activeAppId;
      return (
        '<button class="stage-tab" type="button" role="tab" data-app="' + app.id + '" aria-selected="' + on +
        '" aria-controls="stageCanvas" tabindex="' + (on ? "0" : "-1") + '">' +
        AF.appIcon(app, 24) + esc(app.name) + "</button>"
      );
    }).join("");
    stageTabs.querySelectorAll(".stage-tab").forEach((tab, index) => {
      tab.addEventListener("click", () => selectApp(tab.dataset.app));
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const tabs = Array.from(stageTabs.querySelectorAll(".stage-tab"));
        const next = tabs[(index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        selectApp(next.dataset.app);
      });
    });
  }

  function renderStage() {
    const app = byId(activeAppId) || APPS[0];
    if (!app) return;
    const entry = SHOTS[app.id];
    if (stageCanvas) {
      if (AF.hasShots(entry)) {
        stageCanvas.classList.add("stage-canvas--captures");
        stageCanvas.innerHTML = AF.galleryHTML(app, entry);
        AF.wireGallery(stageCanvas, app, entry);
      } else {
        stageCanvas.classList.remove("stage-canvas--captures");
        stageCanvas.innerHTML = AF.mockup(app).replace('class="device ', 'class="device is-active ');
      }
    }
    if (!stagePanel) return;
    const release = app.version && app.version !== "—" ? app.version : "Source only";
    const shotTotal = AF.hasShots(entry) ? entry.count : 0;
    stagePanel.innerHTML =
      '<div class="stage-panel-top">' + AF.statusChip(app) +
      '<span class="chip chip--mute">' + esc(app.tag || app.category) + "</span>" +
      (shotTotal
        ? '<span class="chip chip--soft">' + shotTotal + " real captures</span>"
        : '<span class="chip chip--mute">Interface model</span>') +
      "</div>" +
      '<h3 class="stage-title">' + esc(app.name) + "</h3>" +
      '<p class="stage-tagline">' + esc(app.tagline) + "</p>" +
      '<p class="stage-desc">' + esc(app.description) + "</p>" +
      '<dl class="spec-list">' +
      '<div class="spec-row"><dt>Target</dt><dd>' + esc(app.api) + "</dd></div>" +
      '<div class="spec-row"><dt>Bundle</dt><dd class="is-mono">' + esc(app.bundle) + "</dd></div>" +
      '<div class="spec-row"><dt>Pattern</dt><dd>' + esc(AF.patternOf(app)) + "</dd></div>" +
      '<div class="spec-row"><dt>Stack</dt><dd>' + esc((app.stack || []).join(" · ")) + "</dd></div>" +
      '<div class="spec-row"><dt>Latest</dt><dd>' + esc(release) + "</dd></div>" +
      "</dl>" +
      '<div class="stage-actions">' +
      '<a class="btn btn--primary" href="/apps/' + app.id + (shotTotal ? "#screens" : "") + '">' +
      (shotTotal ? "See all " + shotTotal + " captures" : "Open project page") + "</a>" +
      '<button class="btn btn--ghost" type="button" data-open="' + app.id + '">Quick look</button>' +
      '<a class="btn btn--text" href="' + app.repo + '" target="_blank" rel="noopener">Source on GitHub' + chevron + "</a>" +
      "</div>";
    const quick = stagePanel.querySelector("[data-open]");
    if (quick) quick.addEventListener("click", () => openModal(quick.dataset.open));
  }

  function selectApp(id) {
    activeAppId = id;
    if (stageTabs) {
      stageTabs.querySelectorAll(".stage-tab").forEach((tab) => {
        const on = tab.dataset.app === id;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
    }
    renderStage();
  }

  /* ---------- Catalogue ---------- */
  function visibleApps() {
    const q = query.trim().toLowerCase();
    return APPS.filter((app) => {
      const tags = [...(app.stack || []), ...(app.filterTags || [])].map((t) => t.toLowerCase());
      if (activeStack !== "all" && !tags.includes(activeStack.toLowerCase())) return false;
      if (!q) return true;
      const hay = [app.name, app.tagline, app.tag, app.category, app.description, app.api, app.bundle, app.status, (app.stack || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => hay.includes(term));
    });
  }

  function cardHTML(app) {
    const stack = (app.stack || []).slice(0, 3);
    const shots = SHOTS[app.id];
    return (
      '<article class="port-card">' +
      '<div class="port-card-top">' + AF.appIcon(app, 56) +
      '<div class="port-card-head"><h3 class="port-card-name">' + esc(app.name) + "</h3>" +
      '<p class="port-card-tagline">' + esc(app.tagline) + "</p></div></div>" +
      '<p class="port-card-desc is-clamped">' + esc(app.description) + "</p>" +
      '<div class="port-card-stack">' + AF.statusChip(app) +
      (shots && shots.count ? '<span class="chip chip--soft">' + shots.count + " captures</span>" : "") +
      stack.map((s) => '<span class="chip chip--mute">' + esc(s) + "</span>").join("") + "</div>" +
      '<div class="port-card-foot">' +
      '<a class="link-arrow" href="/apps/' + app.id + (shots && shots.count ? "#screens" : "") + '">' +
      (shots && shots.count ? "See captures" : "Open project") + chevron + "</a>" +
      '<a class="link-quiet" href="' + app.repo + '" target="_blank" rel="noopener">Source</a>' +
      "</div></article>"
    );
  }

  function renderPorts() {
    if (!portsGrid) return;
    const list = visibleApps();
    portsGrid.innerHTML = list.map(cardHTML).join("");
    if (emptyState) emptyState.classList.toggle("is-hidden", list.length > 0);
  }

  /* ---------- Patterns + compatibility ---------- */
  function renderPatterns() {
    if (!patternGrid) return;
    patternGrid.innerHTML = AF.PATTERNS.map((p) => {
      const app = byId(p.appliesTo);
      return (
        '<article class="pattern-card">' +
        '<span class="pattern-badge">' + esc(p.badge) + "</span>" +
        '<h3 class="pattern-title">' + esc(p.title) + "</h3>" +
        '<p class="pattern-lead">' + esc(p.lead) + "</p>" +
        '<ul class="flow">' + p.flow.map((step) => "<li>" + esc(step) + "</li>").join("") + "</ul>" +
        '<p class="pattern-applied">Proved by <a href="/apps/' + p.appliesTo + '">' + esc(app ? app.name : p.appliesTo) + "</a></p>" +
        "</article>"
      );
    }).join("");
  }

  function renderCompat() {
    if (!compatBody) return;
    compatBody.innerHTML = AF.COMPAT.map((row) => {
      const app = byId(row.id);
      if (!app) return "";
      const tone = row.tone === "ok" ? "chip--ok" : "chip--warn";
      return (
        "<tr><td><span class=\"cell-app\">" + AF.appIcon(app, 32) + "<span>" + esc(app.name) + "</span></span></td>" +
        "<td>" + esc(row.target) + "</td>" +
        '<td><span class="chip ' + tone + '"><span class="chip-dot"></span>' + esc(row.verification) + "</span></td>" +
        "<td>" + esc(row.checked) + "</td>" +
        "<td>" + esc(row.form) + "</td></tr>"
      );
    }).join("");
  }

  /* ---------- Builders ---------- */
  function renderBuilders() {
    if (!buildersGrid) return;
    buildersGrid.innerHTML = CONTRIBUTORS.map((p) => {
      const initial = esc((p.name || "A").charAt(0).toUpperCase());
      return (
        '<article class="builder-card">' +
        '<div class="builder-top">' +
        '<img class="builder-avatar" src="' + p.avatar + '" alt="' + esc(p.name) + '" width="60" height="60" loading="lazy" ' +
        'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'builder-avatar\',textContent:\'' + initial + '\'}))" />' +
        '<div><h3 class="builder-name">' + esc(p.name) + '</h3><p class="builder-role">' + esc(p.role) + "</p></div></div>" +
        '<div class="builder-focus">' + (p.focus || []).map((f) => '<span class="chip chip--mute">' + esc(f) + "</span>").join("") + "</div>" +
        '<div class="builder-links">' +
        '<a class="btn btn--ghost btn--sm" href="' + p.github + '" target="_blank" rel="noopener">GitHub</a>' +
        (p.twitter ? '<a class="btn btn--ghost btn--sm" href="' + p.twitter + '" target="_blank" rel="noopener">' + esc(p.twitterHandle || "X") + "</a>" : "") +
        "</div></article>"
      );
    }).join("");
  }

  /* Curated wall of real captures from the repositories. */
  const WALL = [
    { app: "opentwit-web", shot: "phone-home-for-you" },
    { app: "opentwit", shot: "phone-home" },
    { app: "opentwit-web", shot: "foldable-home-rail", group: "foldable" },
    { app: "ohemacs", shot: "pc-gui-rust-mode" },
    { app: "opentwit-web", shot: "phone-compose-sheet" },
    { app: "opentwit", shot: "phone-dms" },
    { app: "ohemacs", shot: "pc-terminal-cli" },
    { app: "opentwit-web", shot: "phone-notifications" }
  ];

  function renderCaptureWall() {
    if (!captureWall) return;
    AF.mountCaptureWall(captureWall, APPS, SHOTS, WALL);
    if (shotCount) {
      const total = Object.values(SHOTS).reduce((sum, entry) => sum + (entry.count || 0), 0);
      shotCount.textContent = total ? "These " + total + " captures" : "These captures";
    }
  }

  /* ---------- Quick look sheet ---------- */
  function openModal(id) {
    const app = byId(id);
    const modal = $("modal");
    if (!app || !modal) return;
    lastFocus = document.activeElement;
    $("modalIcon").innerHTML = AF.appIcon(app, 52);
    $("modalStatus").innerHTML = AF.statusChip(app);
    $("modalTitle").textContent = app.name;
    $("modalTagline").textContent = app.tagline;
    $("modalDesc").textContent = app.description;
    $("modalSpecs").innerHTML =
      "<div><b>Target</b><span>" + esc(app.api) + "</span></div>" +
      "<div><b>Bundle</b><span>" + esc(app.bundle) + "</span></div>" +
      "<div><b>Pattern</b><span>" + esc(AF.patternOf(app)) + "</span></div>" +
      "<div><b>Stack</b><span>" + esc((app.stack || []).join(" · ")) + "</span></div>";
    $("modalFeatures").innerHTML = (app.features || []).map((f) => "<li>" + esc(f) + "</li>").join("");
    $("modalPorting").innerHTML = (app.porting || []).map((p) => "<li>" + esc(p) + "</li>").join("");
    $("modalInstall").textContent = app.install || "";
    $("modalProject").href = "/apps/" + app.id;
    $("modalRepo").href = app.repo;
    $("modalDisclaimer").textContent = app.disclaimer || "";
    $("modalCopy").onclick = () => AF.copy(app.install || "", "Install command copied");
    modal.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
    $("modalClose").focus();
  }

  function closeModal() {
    const modal = $("modal");
    if (!modal || modal.classList.contains("is-hidden")) return;
    modal.classList.add("is-hidden");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Wiring ---------- */
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value;
      if (searchClear) searchClear.classList.toggle("is-hidden", !query);
      renderPorts();
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      query = "";
      if (searchInput) searchInput.value = "";
      searchClear.classList.add("is-hidden");
      renderPorts();
      if (searchInput) searchInput.focus();
    });
  }
  if (filterPills) {
    filterPills.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      activeStack = pill.dataset.stack;
      filterPills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", String(p === pill)));
      renderPorts();
    });
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      query = "";
      activeStack = "all";
      if (searchInput) searchInput.value = "";
      if (searchClear) searchClear.classList.add("is-hidden");
      if (filterPills) {
        filterPills.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.stack === "all")));
      }
      renderPorts();
    });
  }
  const modal = $("modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    $("modalClose").addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  AF.wireShell();

  async function boot() {
    try {
      const [appsRes, contribRes, shotsRes] = await Promise.all([
        fetch("/api/apps"),
        fetch("/api/contributors"),
        fetch("/api/shots")
      ]);
      if (!appsRes.ok) throw new Error("apps request failed");
      APPS = await appsRes.json();
      CONTRIBUTORS = contribRes.ok ? await contribRes.json() : [];
      SHOTS = shotsRes.ok ? await shotsRes.json() : {};
      if (apiErrorBanner) apiErrorBanner.classList.add("is-hidden");
      const wanted = new URLSearchParams(location.search).get("app");
      activeAppId = APPS.some((a) => a.id === wanted) ? wanted : (APPS.find((a) => a.id === "opentwit-web") ? "opentwit-web" : APPS[0].id);
      renderStageTabs();
      renderStage();
      renderPorts();
      renderPatterns();
      renderCompat();
      renderBuilders();
      renderCaptureWall();
    } catch (err) {
      if (apiErrorBanner) apiErrorBanner.classList.remove("is-hidden");
      if (patternGrid) renderPatterns();
      if (compatBody) renderCompat();
      console.error(err);
    }
  }

  boot();
})();
