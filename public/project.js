/* AppFactory — project page controller: release assets, preview, architecture, install. */
(function () {
  const AF = window.AF;
  const esc = AF.esc;
  const $ = (id) => document.getElementById(id);

  function appIdFromUrl() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "apps" && parts[1]) return parts[1].toLowerCase();
    return (new URLSearchParams(window.location.search).get("id") || "opengmaps").toLowerCase();
  }
  const currentId = appIdFromUrl();
  const chevron =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  const isSignedHap = (asset) => asset.type === "hap" && /signed/i.test(asset.name) && !/unsigned/i.test(asset.name);

  function renderSpecs(app) {
    $("projectSpecs").innerHTML =
      '<div class="spec-cell"><b>Target</b><span>' + esc(app.api) + "</span></div>" +
      '<div class="spec-cell"><b>Bundle</b><span class="is-mono">' + esc(app.bundle) + "</span></div>" +
      '<div class="spec-cell"><b>Pattern</b><span>' + esc(AF.patternOf(app)) + "</span></div>" +
      '<div class="spec-cell"><b>Stack</b><span>' + esc((app.stack || []).join(" · ")) + "</span></div>";
  }

  function renderAssets(app, release) {
    const grid = $("assetGrid");
    const meta = $("relMeta");
    const tag = $("relTag");
    const title = $("relTitle");
    const gh = $("relGhLink");
    const body = $("relBody");
    if (!release || !release.assets || !release.assets.length) {
      title.textContent = app.name + " — source only";
      meta.textContent = "No packaged release yet. Build from source with the Install tab.";
      tag.textContent = app.version || "main";
      gh.href = app.repo + "/releases";
      body.textContent = "Automated releases are pending for this port. The source tree builds today — see the Install tab.";
      grid.innerHTML =
        '<article class="asset"><div class="asset-top"><span class="asset-kind is-soft">ZIP</span><span class="chip chip--mute">Source</span></div>' +
        "<h3>" + esc(app.id + "-main.zip") + "</h3><p>Latest tree from GitHub</p>" +
        '<div class="asset-actions"><a class="btn btn--ghost btn--sm" href="' + app.repo + '/archive/refs/heads/main.zip" target="_blank" rel="noopener">Download ZIP</a></div></article>';
      return;
    }
    title.textContent = release.name || app.name + " " + release.tagName;
    const when = release.publishedAt
      ? new Date(release.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "";
    meta.textContent = when ? "Published " + when + " · from GitHub Releases" : "From GitHub Releases";
    tag.textContent = release.tagName;
    gh.href = release.htmlUrl || app.repo + "/releases";
    body.textContent = release.body || "No release notes provided.";

    const order = { hap: 0, binary: 1, bundle: 2, archive: 3 };
    const assets = release.assets.slice().sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));
    grid.innerHTML = assets
      .map((asset) => {
        const isHap = asset.type === "hap";
        const kind = isHap ? ".HAP" : asset.type === "binary" ? "BIN" : asset.type === "bundle" ? "BND" : "ZIP";
        const primary = isSignedHap(asset);
        const flags = (primary ? '<span class="chip chip--new">Signed build</span>' : "") +
          '<span class="chip chip--mute">' + esc(asset.formattedSize || "") + "</span>";
        return (
          '<article class="asset' + (primary ? " is-primary" : "") + '">' +
          '<div class="asset-top"><span class="asset-kind' + (isHap ? "" : " is-soft") + '">' + kind + "</span>" + flags + "</div>" +
          "<h3>" + esc(asset.name) + "</h3><p>" + esc(asset.label || "") + "</p>" +
          (asset.installHint ? "<code>$ " + esc(asset.installHint) + "</code>" : "") +
          '<div class="asset-actions"><a class="btn ' + (isHap ? "btn--primary" : "btn--ghost") + ' btn--sm" href="' + asset.downloadUrl +
          '" target="_blank" rel="noopener" download="' + esc(asset.name) + '">Download</a>' +
          (asset.installHint
            ? '<button class="btn btn--text" type="button" data-copytext="' + esc(asset.installHint) + '">Copy command</button>'
            : "") +
          "</div></article>"
        );
      })
      .join("");
    grid.querySelectorAll("[data-copytext]").forEach((btn) => {
      btn.addEventListener("click", () => AF.copy(btn.dataset.copytext, "Command copied"));
    });
  }

  function renderPreview(app, contributors, release) {
    $("previewStage").innerHTML = AF.mockup(app, "preview");
    $("featureList").innerHTML = (app.features || []).map((f) => "<li>" + esc(f) + "</li>").join("");
    const makers = (app.maintainers || []).map((id) => contributors.find((c) => c.id === id) || { name: id, github: "https://github.com/" + id });
    $("maintainerList").innerHTML = makers
      .map(
        (m) =>
          '<div class="maintainer-card">' +
          '<span class="builder-avatar" aria-hidden="true">' + esc((m.name || "A").charAt(0).toUpperCase()) + "</span>" +
          '<span class="maintainer-meta"><b>' + esc(m.name) + "</b><span>" + esc(m.role || "Maintainer") + "</span></span>" +
          '<a class="link-arrow" href="' + (m.github || "#") + '" target="_blank" rel="noopener">GitHub</a></div>'
      )
      .join("");
  }

  function renderArchitecture(app) {
    const pattern = AF.PATTERNS.find((p) => p.appliesTo === app.id) || AF.PATTERNS[0];
    $("archTitle").textContent = pattern.badge.split(" · ")[1] + " — " + pattern.title;
    $("archSub").textContent = pattern.lead;
    $("archFlow").innerHTML =
      "<h3>Call path</h3><ol>" + pattern.flow.map((step) => "<li>" + esc(step) + "</li>").join("") + "</ol>";
    $("archPoints").innerHTML = (app.porting || []).map((p) => "<li>" + esc(p) + "</li>").join("");
    const compat = AF.COMPAT.find((c) => c.id === app.id);
    $("archCompat").innerHTML = compat
      ? "<li>" + esc(compat.target) + "</li><li>" + esc(compat.verification) + " · " + esc(compat.checked) + "</li><li>" + esc(compat.form) + "</li>"
      : "<li>" + esc(app.api) + "</li>";
  }

  function renderInstall(app, release) {
    let hapName = app.id + ".hap";
    if (release && release.assets) {
      const haps = release.assets.filter((a) => a.type === "hap");
        const primary = haps.find(isSignedHap) || haps[0];
      if (primary) hapName = primary.name;
    }
    $("installHdc").textContent =
      "# download " + hapName + " from the Downloads tab\nhdc list targets\nhdc install " + hapName +
      "\nhdc shell aa start -a EntryAbility -b " + app.bundle;
    $("installBuild").textContent = app.install || "git clone " + app.repo;
    $("permRow").innerHTML = [app.bundle, app.api, app.license]
      .filter(Boolean)
      .map((value) => '<span class="perm">' + esc(value) + "</span>")
      .join("");
  }

  function renderOther(apps) {
    $("otherGrid").innerHTML = apps
      .filter((a) => a.id !== currentId)
      .map(
        (app) =>
          '<a class="other-card" href="/apps/' + app.id + '">' + AF.appIcon(app, 40) +
          '<span class="other-meta"><b>' + esc(app.name) + '</b><span>' + esc(app.tagline) + "</span></span>" + chevron + "</a>"
      )
      .join("");
  }

  function wireTabs() {
    const buttons = Array.from(document.querySelectorAll(".tabnav button"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        document.querySelectorAll(".pane").forEach((pane) => pane.classList.remove("active"));
        const pane = $("pane-" + btn.dataset.pane);
        if (pane) pane.classList.add("active");
      });
    });
    document.querySelectorAll(".copy-btn[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const source = $(btn.dataset.copy);
        if (source) AF.copy(source.textContent, "Copied");
      });
    });
  }

  AF.wireShell();

  (async function boot() {
    try {
      const [appsRes, relRes, contribRes] = await Promise.all([
        fetch("/api/apps"),
        fetch("/api/releases/" + currentId),
        fetch("/api/contributors")
      ]);
      const apps = await appsRes.json();
      const app = apps.find((a) => a.id === currentId) || apps[0];
      const release = relRes.ok ? await relRes.json() : null;
      const contributors = contribRes.ok ? await contribRes.json() : [];

      document.title = app.name + " — AppFactory";
      const pageUrl = "https://appfactoryhos.vercel.app/apps/" + app.id;
      $("canonicalLink").href = pageUrl;
      $("ogUrl").setAttribute("content", pageUrl);
      $("ogTitle").setAttribute("content", app.name + " — AppFactory");
      $("breadName").textContent = app.name;
      $("projectIcon").innerHTML = AF.appIcon(app, 64);
      $("projectChips").innerHTML = AF.statusChip(app) +
        '<span class="chip chip--mute">' + esc(app.tag || app.category) + "</span>" +
        '<span class="chip chip--soft">' + esc(app.license) + "</span>";
      $("projectName").textContent = app.name;
      $("projectTagline").textContent = app.tagline;
      $("projectDesc").textContent = app.description;
      renderSpecs(app);

      const repo = $("heroRepo");
      repo.href = app.repo;
      $("heroCopyInstall").addEventListener("click", () => AF.copy(app.install || "", "Install command copied"));

      let primary = null;
      if (release && release.assets) {
        const haps = release.assets.filter((a) => a.type === "hap");
        primary = haps.find(isSignedHap) || haps[0] || null;
      }
      const dl = $("heroDownload");
      const dlLabel = $("heroDownloadLabel");
      if (primary) {
        dl.href = primary.downloadUrl;
        dl.setAttribute("download", primary.name);
        dlLabel.textContent = "Download " + primary.formattedSize + " signed HAP";
      } else {
        dl.href = app.repo + "/archive/refs/heads/main.zip";
        dlLabel.textContent = "Download source (ZIP)";
      }

      renderAssets(app, release);
      renderPreview(app, contributors, release);
      renderArchitecture(app);
      renderInstall(app, release);
      renderOther(apps);
      $("disclaimer").textContent = app.disclaimer || "";
      wireTabs();
    } catch (err) {
      console.error(err);
      const body = $("relBody");
      if (body) body.textContent = "Couldn’t load this port. Run npm start and reload.";
    }
  })();
})();
