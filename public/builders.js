/* AppFactory — builders page: maintainer profiles rendered from /api/contributors. */
(function () {
  const AF = window.AF;
  const esc = AF.esc;
  const grid = document.getElementById("builderProfiles");
  if (!grid) return;

  const chevron =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  function projectRows(apps, contributorId) {
    const mine = apps.filter((a) => (a.maintainers || []).includes(contributorId));
    if (!mine.length) return '<p class="section-sub">No ports listed yet.</p>';
    return (
      '<div class="other-grid">' +
      mine
        .map(
          (app) =>
            '<a class="other-card" href="/apps/' + app.id + '">' + AF.appIcon(app, 40) +
            '<span class="other-meta"><b>' + esc(app.name) + '</b><span>' + esc(app.api) + "</span></span>" +
            chevron + "</a>"
        )
        .join("") +
      "</div>"
    );
  }

  function profileHTML(person, apps) {
    const initial = esc((person.name || "A").charAt(0).toUpperCase());
    return (
      '<article class="builder-profile">' +
      '<div class="builder-profile-top">' +
      '<img class="builder-avatar" src="' + person.avatar + '" alt="' + esc(person.name) + '" width="72" height="72" loading="lazy" ' +
      "onerror=\"this.replaceWith(Object.assign(document.createElement('span'),{className:'builder-avatar',textContent:'" + initial + "'}))\" />" +
      "<div class=\"builder-id\"><h2 class=\"builder-name\">" + esc(person.name) + '</h2><p class="builder-role">' + esc(person.role) + "</p></div>" +
      "</div>" +
      '<div class="builder-focus">' + (person.focus || []).map((f) => '<span class="chip chip--mute">' + esc(f) + "</span>").join("") + "</div>" +
      '<div class="profile-links">' +
      '<a class="btn btn--ghost btn--sm" href="' + person.github + '" target="_blank" rel="noopener">GitHub</a>' +
      (person.twitter
        ? '<a class="btn btn--ghost btn--sm" href="' + person.twitter + '" target="_blank" rel="noopener">' + esc(person.twitterHandle || "X") + "</a>"
        : "") +
      "</div>" +
      "<div><h3 class=\"section-label\">Looks after</h3>" + projectRows(apps, person.id) + "</div>" +
      "</article>"
    );
  }

  AF.wireShell();

  (async function boot() {
    try {
      const [peopleRes, appsRes] = await Promise.all([fetch("/api/contributors"), fetch("/api/apps")]);
      const people = await peopleRes.json();
      const apps = appsRes.ok ? await appsRes.json() : [];
      grid.innerHTML = people.map((p) => profileHTML(p, apps)).join("");
    } catch (err) {
      grid.innerHTML = '<div class="notice">Couldn’t reach <code>/api/contributors</code>. Run <code>npm start</code> and reload.</div>';
      console.error(err);
    }
  })();
})();
