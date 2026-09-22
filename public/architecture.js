/* AppFactory — architecture page: chapters rendered from the shared pattern list. */
(function () {
  const AF = window.AF;
  const esc = AF.esc;

  const TABLE = [
    { id: "opentwit", keeps: "Nothing — greenfield", writes: "The whole client in ArkTS", renders: "ArkUI", risk: "Vendor API limits and cost tiers" },
    { id: "opentwit-web", keeps: "The service's entire web app", writes: "Native chrome + injected CSS/JS bridge", renders: "System Web component", risk: "Page DOM changes break the injected hooks" },
    { id: "opengmaps", keeps: "All Dart UI, state and models", writes: "One OHOS platform plugin", renders: "ArkWeb + Flutter", risk: "A WebView surface inside a Flutter tree" },
    { id: "ohemacs", keeps: "The upstream C engine and its VM", writes: "Window, surface and event bridge", renders: "XComponent + EGL", risk: "Cross-compile and dump-file plumbing" },
    { id: "whatisit", keeps: "Nothing on-device — the phone stays thin", writes: "Go daemon + thin ArkTS client", renders: "ArkUI over WebSocket pushes", risk: "A server to host, secure and keep online" }
  ];

  const chapters = document.getElementById("chapters");
  const tableBody = document.getElementById("patternTable");
  const compatBody = document.getElementById("compatBody");

  function chapterHTML(pattern) {
    const app = AF.fallback[pattern.appliesTo] ? pattern.appliesTo : pattern.appliesTo;
    return (
      '<section class="chapter" id="pattern-' + pattern.appliesTo + '">' +
      '<div class="chapter-head"><span class="pattern-badge">' + esc(pattern.badge) + "</span>" +
      "<h2>" + esc(pattern.title) + '</h2><p class="chapter-lead">' + esc(pattern.lead) + "</p></div>" +
      '<div class="chapter-grid"><div class="chapter-body">' +
      pattern.desc.map((p) => "<p>" + esc(p) + "</p>").join("") +
      '<div class="page-actions"><a class="btn btn--tonal" href="/apps/' + app + '">Open the port that proves it</a></div>' +
      "</div>" +
      '<div class="chapter-side">' +
      '<div class="arch-flow"><h3>Call path</h3><ol>' + pattern.flow.map((step) => "<li>" + esc(step) + "</li>").join("") + "</ol></div>" +
      '<div class="side-card"><h3>Good fit when</h3><ul>' + pattern.points.map((p) => "<li>" + esc(p) + "</li>").join("") + "</ul></div>" +
      "</div></div></section>"
    );
  }

  AF.wireShell();

  (async function boot() {
    if (chapters) chapters.innerHTML = AF.PATTERNS.map(chapterHTML).join("");

    let apps = [];
    try {
      const res = await fetch("/api/apps");
      apps = res.ok ? await res.json() : [];
    } catch (err) {
      console.error(err);
    }
    const nameOf = (id) => {
      const app = apps.find((a) => a.id === id);
      return app ? app.name : id;
    };

    if (tableBody) {
      tableBody.innerHTML = TABLE.map((row) => {
        const pattern = AF.PATTERNS.find((p) => p.id === row.id);
        return (
          "<tr><td><strong>" + esc(pattern ? pattern.title : row.id) + "</strong><br /><a class=\"link-arrow\" href=\"/apps/" + row.id + '">' + esc(nameOf(row.id)) + "</a></td>" +
          "<td>" + esc(row.keeps) + "</td><td>" + esc(row.writes) + "</td><td>" + esc(row.renders) + "</td><td>" + esc(row.risk) + "</td></tr>"
        );
      }).join("");
    }

    if (compatBody) {
      compatBody.innerHTML = AF.COMPAT.map((row) => {
        const app = apps.find((a) => a.id === row.id);
        const tone = row.tone === "ok" ? "chip--ok" : "chip--warn";
        return (
          "<tr><td><span class=\"cell-app\">" + (app ? AF.appIcon(app, 32) : "") + "<span>" + esc(nameOf(row.id)) + "</span></span></td>" +
          "<td>" + esc(row.target) + "</td>" +
          '<td><span class="chip ' + tone + '"><span class="chip-dot"></span>' + esc(row.verification) + "</span></td>" +
          "<td>" + esc(row.checked) + "</td><td>" + esc(row.form) + "</td></tr>"
        );
      }).join("");
    }
  })();
})();
