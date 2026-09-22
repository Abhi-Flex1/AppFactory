/* Verifies the boot sequence's three escape hatches:
   1. prefers-reduced-motion never arms it,
   2. a second visit in the same session never arms it,
   3. the Skip button finishes it instantly.
   Run: node scripts/boot-guard-test.js   (server must be on :3000) */
const { JSDOM, VirtualConsole } = require("jsdom");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SPACER_H = 4000;

function make({ reduced = false, seedSession = false } = {}) {
  const problems = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    const m = String(e.message || e);
    if (!/HTMLCanvasElement|fetch is not defined/.test(m)) problems.push(m);
  });
  vc.on("error", (...a) => problems.push(a.join(" ")));
  return JSDOM.fromURL("http://localhost:3000/", {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        get() {
          return this.id === "bootSpacer" ? SPACER_H : 0;
        }
      });
      let fakeY = 0;
      Object.defineProperty(window, "scrollY", { configurable: true, get: () => fakeY });
      window.__setScroll = (v) => {
        fakeY = v;
        window.dispatchEvent(new window.Event("scroll"));
      };
      window.matchMedia = (q) => ({
        matches: reduced && /prefers-reduced-motion/.test(q),
        media: q,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {}
      });
      window.scrollTo = () => {
        fakeY = 0;
      };
      if (!window.fetch) window.fetch = (u, o) => fetch(new URL(u, "http://localhost:3000"), o);
      if (seedSession) window.sessionStorage.setItem("af-booted", "1");
    }
  }).then((dom) => ({ dom, problems }));
}

(async () => {
  const log = [];
  const ok = (label, cond, extra) =>
    log.push((cond ? "PASS  " : "FAIL  ") + label + (extra !== undefined ? "  → " + extra : ""));

  /* 1. reduced motion */
  {
    const { dom, problems } = await make({ reduced: true });
    await sleep(1400);
    const d = dom.window.document;
    ok("reduced motion: never armed", !d.documentElement.classList.contains("boot-armed"));
    ok("reduced motion: overlay stays hidden", d.getElementById("boot").hidden === true);
    ok("reduced motion: spacer collapsed", dom.window.getComputedStyle(d.getElementById("bootSpacer")).display === "none", dom.window.getComputedStyle(d.getElementById("bootSpacer")).display);
    ok("reduced motion: page still alive", d.documentElement.classList.contains("ui-ready"));
    ok("reduced motion: content revealed", d.querySelectorAll("[data-reveal].is-in").length > 0, d.querySelectorAll("[data-reveal].is-in").length);
    ok("reduced motion: no errors", problems.length === 0, problems.join(" ;; "));
  }

  /* 2. second visit in the same session */
  {
    const { dom, problems } = await make({ seedSession: true });
    await sleep(1400);
    const d = dom.window.document;
    ok("session return: never armed", !d.documentElement.classList.contains("boot-armed"));
    ok("session return: overlay hidden", d.getElementById("boot").hidden === true);
    ok("session return: content revealed", d.querySelectorAll("[data-reveal].is-in").length > 0, d.querySelectorAll("[data-reveal].is-in").length);
    ok("session return: no errors", problems.length === 0, problems.join(" ;; "));
  }

  /* 3. skip button */
  {
    const { dom, problems } = await make();
    await sleep(1400);
    const w = dom.window;
    const d = w.document;
    ok("skip: armed on first visit", d.documentElement.classList.contains("boot-armed"));
    ok("skip: button present and reachable", !!d.querySelector(".boot-skip"));
    d.querySelector(".boot-skip").click();
    await sleep(900);
    ok("skip: releases the page immediately", !d.documentElement.classList.contains("boot-armed"));
    ok("skip: records the session flag", w.sessionStorage.getItem("af-booted") === "1", w.sessionStorage.getItem("af-booted"));
    ok("skip: hides the overlay", d.getElementById("boot").hidden === true);
    ok("skip: reveals content", d.querySelectorAll("[data-reveal].is-in").length > 0, d.querySelectorAll("[data-reveal].is-in").length);
    ok("skip: no errors", problems.length === 0, problems.join(" ;; "));
  }

  console.log(log.join("\n"));
  const failed = log.filter((l) => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - failed) + "/" + log.length + " passed");
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS ERROR", e);
  process.exit(2);
});
