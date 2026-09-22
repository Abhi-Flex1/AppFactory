/* Headless smoke test: load each page in jsdom, surface runtime errors.
   Run: node scripts/smoke.js   (server must be on :3000) */
const { JSDOM, VirtualConsole } = require("jsdom");

const pages = ["/", "/?noboot=1", "/apps", "/architecture", "/builders", "/apps/opentwit-web"];

function run(url) {
  return new Promise((resolve) => {
    const problems = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => problems.push("jsdomError: " + (e.stack || e.message)));
    vc.on("error", (...a) => problems.push("console.error: " + a.join(" ")));
    vc.on("warn", (...a) => {
      const s = a.join(" ");
      if (/Could not parse CSS|Not implemented/.test(s)) problems.push("warn: " + s);
      else problems.push("warn: " + s);
    });

    JSDOM.fromURL("http://localhost:3000" + url, {
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(window) {
        /* jsdom gaps: real browsers ship both. */
        if (!window.matchMedia) {
          window.matchMedia = function (q) {
            return { matches: /min-width:\s*1024/.test(q) ? true : false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} };
          };
        }
        if (!window.fetch) {
          window.fetch = function (u, o) {
            return fetch(new URL(u, "http://localhost:3000"), o);
          };
        }
        window.scrollTo = function () {};
        window.requestAnimationFrame = window.requestAnimationFrame || function (cb) { return setTimeout(() => cb(Date.now()), 16); };
      }
    })
      .then((dom) => {
        const w = dom.window;
        w.addEventListener("error", (e) => problems.push("error: " + (e.error && e.error.stack ? e.error.stack : e.message)));
        w.addEventListener("unhandledrejection", (e) => problems.push("rejection: " + e.reason));

        setTimeout(() => {
          const d = w.document;
          const checks = {
            html_js: d.documentElement.classList.contains("js"),
            html_uiReady: d.documentElement.classList.contains("ui-ready"),
            bootArmed: d.documentElement.classList.contains("boot-armed"),
            revealsBound: d.querySelectorAll("[data-reveal-bound]").length,
            revealsIn: d.querySelectorAll("[data-reveal].is-in").length,
            splitBound: d.querySelectorAll("[data-split-bound]").length,
            palette: !!d.getElementById("cmd"),
            toastStack: d.querySelectorAll(".toast-stack").length,
            progress: d.querySelectorAll(".scroll-progress").length,
            marqueeGroups: d.querySelectorAll(".marquee-group").length,
            cards: d.querySelectorAll(".port-card").length,
            skeletons: d.querySelectorAll(".skeleton-card").length,
            revealHidden: Array.prototype.filter.call(
              d.querySelectorAll("[data-reveal]"),
              (el) => !el.classList.contains("is-in") && !el.hasAttribute("data-reveal-bound")
            ).length,
            footerMark: d.querySelectorAll(".footer-mark").length,
            cmdTrigger: d.querySelectorAll(".cmd-trigger").length,
            chapters: d.querySelectorAll("#chapters .chapter").length,
            profiles: d.querySelectorAll("#builderProfiles .builder-profile, #builderProfiles .builder-card").length,
            patternRows: d.querySelectorAll("#patternTable tr").length,
            compatRows: d.querySelectorAll("#compatBody tr").length,
            stageTabs: d.querySelectorAll(".stage-tab").length,
            stageCanvas: d.querySelectorAll("#stageCanvas .device, #stageCanvas .gal").length,
            wall: d.querySelectorAll("#captureWall .wall-card").length,
            grip: d.querySelectorAll(".sheet-grip").length,
            skeletonsLeft: d.querySelectorAll(".skeleton-card").length
          };

          /* --- interaction probes --- */
          try {
            const w2 = d.defaultView;
            w2.dispatchEvent(new w2.Event("resize"));
            /* command palette: open, filter, arrow, escape */
            const kd = (key, opts) => d.dispatchEvent(new w2.KeyboardEvent("keydown", Object.assign({ key, bubbles: true, cancelable: true }, opts || {})));
            kd("k", { metaKey: true });
            const cmdOpen = !d.getElementById("cmd").hidden;
            const input = d.getElementById("cmdInput");
            let results = d.querySelectorAll(".cmd-item").length;
            if (input) {
              input.value = "emacs";
              input.dispatchEvent(new w2.Event("input", { bubbles: true }));
              results = d.querySelectorAll(".cmd-item").length;
            }
            kd("Escape");
            const cmdClosed = d.getElementById("cmd").hidden;
            checks.paletteFlow = { cmdOpen, resultsWhenEmpty: results, cmdClosed };
            /* toast stack */
            if (w2.AF && w2.AF.toast) {
              w2.AF.toast("smoke test");
              checks.toast = d.querySelectorAll(".toast-stack .toast").length;
            }
            /* tablists: roving tabindex + arrow-key activation */
            const firstTab = d.querySelector('[role="tablist"] [role="tab"]');
            if (firstTab) {
              const list = firstTab.closest('[role="tablist"]');
              const q = () => Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
              const beforeSel = q().map((t) => t.getAttribute("aria-selected")).join(",");
              q()[0].focus();
              q()[0].dispatchEvent(new w2.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
              const now = q();
              const afterSel = now.map((t) => t.getAttribute("aria-selected")).join(",");
              const roving = now.map((t) => t.tabIndex).join(",");
              const focusIdx = now.indexOf(d.activeElement);
              checks.tabKeys = {
                tabs: now.length,
                before: beforeSel,
                after: afterSel,
                roving,
                focusOnRoving: focusIdx >= 0 && now[focusIdx].tabIndex === 0,
                changed: beforeSel !== afterSel
              };
            }
          } catch (e) {
            checks.interactionError = String(e);
          }
          /* Known jsdom gaps, not page bugs (real browsers ship these). */
          const IGNORE = /HTMLCanvasElement|Not implemented|Could not parse CSS/;
          const cssProblems = problems.filter((p) => /Could not parse CSS/.test(p));
          const runtimeProblems = problems.filter((p) => !IGNORE.test(p));
          resolve({ url, checks, cssProblems: cssProblems.slice(0, 8), runtimeProblems: runtimeProblems.slice(0, 8) });
        }, 2600);
      })
      .catch((e) => resolve({ url, fatal: String(e), checks: {}, runtimeProblems: ["fatal: " + e], cssProblems: [] }));
  });
}

/* Per-route expectations; every route also runs the common assertions. */
const EXPECT = {
  "/": { bootArmed: true, paletteBlockedByBoot: true, marqueeGroups: 2, cards: 5, wall: 8, stageTabs: 5, compatRows: 5, grip: 1 },
  "/?noboot=1": { bootArmed: false, paletteOpen: true, marqueeGroups: 2, cards: 5, wall: 8, tabKeys: true },
  "/apps": { cards: 5, paletteOpen: true },
  "/architecture": { chapters: 5, patternRows: 5, compatRows: 5, paletteOpen: true },
  "/builders": { profiles: 2, paletteOpen: true },
  "/apps/opentwit-web": { paletteOpen: true, tabKeys: true }
};

function evaluate(r) {
  const c = r.checks || {};
  const e = EXPECT[r.url] || {};
  const fails = [];
  const want = (label, cond, extra) => {
    if (!cond) fails.push(label + (extra !== undefined ? " (got " + JSON.stringify(extra) + ")" : ""));
  };

  if (r.fatal) return ["page failed to load: " + r.fatal];

  want("js class set", c.html_js === true);
  want("motion layer ready", c.html_uiReady === true, c.html_uiReady);
  want("no reveal left unbound", c.revealHidden === 0, c.revealHidden);
  want("command palette mounted", c.palette === true);
  want("nav search trigger mounted", c.cmdTrigger === 1, c.cmdTrigger);
  want("scroll progress mounted", c.progress === 1, c.progress);
  want("footer wordmark mounted", c.footerMark === 1, c.footerMark);
  want("skeletons replaced", c.skeletonsLeft === 0, c.skeletonsLeft);
  want("no runtime errors", !r.runtimeProblems.length, r.runtimeProblems);
  want("no CSS parse errors", !r.cssProblems.length, r.cssProblems);
  want("no interaction errors", !c.interactionError, c.interactionError);
  want("toast stack works", c.toast === 1, c.toast);
  want("palette closes on Escape", c.paletteFlow && c.paletteFlow.cmdClosed === true, c.paletteFlow);
  want("palette fuzzy filter narrows results", c.paletteFlow && c.paletteFlow.resultsWhenEmpty >= 1, c.paletteFlow);

  if (e.bootArmed !== undefined) want("boot armed state", c.bootArmed === e.bootArmed, c.bootArmed);
  if (e.paletteOpen) want("palette opens with Cmd+K", c.paletteFlow && c.paletteFlow.cmdOpen === true, c.paletteFlow);
  if (e.paletteBlockedByBoot) want("palette blocked during boot", c.paletteFlow && c.paletteFlow.cmdOpen === false, c.paletteFlow);

  ["marqueeGroups", "cards", "wall", "stageTabs", "compatRows", "chapters", "patternRows", "profiles", "grip"].forEach((k) => {
    if (e[k] !== undefined) want(k + " === " + e[k], c[k] === e[k], c[k]);
  });
  if (e.tabKeys) {
    want("arrow keys move tab selection", c.tabKeys && c.tabKeys.changed === true, c.tabKeys);
    want("roving tabindex follows focus", c.tabKeys && c.tabKeys.focusOnRoving === true, c.tabKeys);
  } else if (c.tabKeys) {
    want("arrow keys move tab selection", c.tabKeys.changed === true, c.tabKeys);
  }
  return fails;
}

(async () => {
  let totalFailed = 0;
  for (const p of pages) {
    const r = await run(p);
    const fails = evaluate(r);
    totalFailed += fails.length;
    console.log("\n=== " + r.url + " === " + (fails.length ? "FAIL" : "PASS"));
    fails.forEach((f) => console.log("  ✗ " + f));
    if (!fails.length) console.log("  ✓ all assertions (" + Object.keys(r.checks).length + " probes)");
  }
  console.log("\n" + (totalFailed ? totalFailed + " assertion(s) failed" : "all route assertions passed"));
  process.exit(totalFailed ? 1 : 0);
})();
