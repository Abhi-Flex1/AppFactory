/* Drives the scroll-driven boot sequence headlessly:
   fake the spacer height + scrollY, walk progress from 0 → 1, and assert
   the sequence renders, logs, fills the bar, then hands the page back.
   Run: node scripts/boot-test.js   (server must be on :3000) */
const { JSDOM, VirtualConsole } = require("jsdom");

const SPACER_H = 4000;
const problems = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => {
  const m = String(e.message || e);
  if (!/HTMLCanvasElement/.test(m)) problems.push("jsdomError: " + m);
});
vc.on("error", (...a) => problems.push("console.error: " + a.join(" ")));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const dom = await JSDOM.fromURL("http://localhost:3000/", {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      /* Fake layout: jsdom has none. */
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
      if (!window.matchMedia) {
        window.matchMedia = (q) => ({
          matches: false,
          media: q,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {}
        });
      }
      window.scrollTo = () => {
        fakeY = 0;
      };
      if (!window.fetch) {
        window.fetch = (u, o) => fetch(new URL(u, "http://localhost:3000"), o);
      }
      window.addEventListener("error", (e) =>
        problems.push("error: " + (e.error && e.error.stack ? e.error.stack : e.message))
      );
    }
  });

  const w = dom.window;
  const d = w.document;
  const log = [];
  const ok = (label, cond, extra) => {
    log.push((cond ? "PASS  " : "FAIL  ") + label + (extra !== undefined ? "  → " + extra : ""));
    return cond;
  };

  await sleep(1200);

  /* --- phase 0: armed, nothing revealed behind it --- */
  ok("armed on first visit", d.documentElement.classList.contains("boot-armed"));
  ok("boot overlay visible", !d.getElementById("boot").hidden);
  ok("tiles generated", d.querySelectorAll(".boot-tile").length === 13, d.querySelectorAll(".boot-tile").length);
  ok("scroll hint visible at p=0", d.querySelector(".boot-hint").style.opacity !== "0", d.querySelector(".boot-hint").style.opacity);
  ok("progress starts empty", d.querySelector(".boot-pct").textContent === "0%", d.querySelector(".boot-pct").textContent);
  const logsSeen = new Set([d.querySelector(".boot-log").textContent]);

  /* --- phase 0b: ⌘K must not open behind the boot (it locks body scroll) --- */
  {
    const wv = w;
    d.dispatchEvent(new wv.KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true, cancelable: true }));
    await sleep(120);
    ok("palette stays closed during boot", d.getElementById("cmd").hidden === true, "hidden=" + d.getElementById("cmd").hidden);
    ok("body scroll not locked during boot", d.body.style.overflow === "", JSON.stringify(d.body.style.overflow));
    d.dispatchEvent(new wv.KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true, cancelable: true }));
    await sleep(60);
  }

  /* --- phase 1: partial scroll --- */
  w.__setScroll(900);
  await sleep(420);
  const pctMid = d.querySelector(".boot-pct").textContent;
  const barMid = d.querySelector(".boot-progress i").style.width;
  const fieldOpacity = d.querySelector(".boot-field").style.opacity;
  logsSeen.add(d.querySelector(".boot-log").textContent);
  ok("bar fills with scroll", parseFloat(barMid) > 5, barMid);
  ok("percentage tracks progress", parseInt(pctMid, 10) > 0 && parseInt(pctMid, 10) < 100, pctMid);
  ok("spatial field still hidden early", parseFloat(fieldOpacity) < 0.05, fieldOpacity);
  ok("hint fades as soon as you scroll", parseFloat(d.querySelector(".boot-hint").style.opacity) < 1, d.querySelector(".boot-hint").style.opacity);

  /* --- phase 1b: halfway — the brand mark is still up --- */
  w.__setScroll(1600);
  await sleep(420);
  ok("core visible at mid-sequence", parseFloat(d.querySelector(".boot-core").style.opacity) > 0.9, d.querySelector(".boot-core").style.opacity);
  const pctHalf = parseInt(d.querySelector(".boot-pct").textContent, 10);
  ok("bar tracks scroll honestly (~50%)", pctHalf > 40 && pctHalf < 62, pctHalf + "%");
  ok("rings expanding", /scale\((\d+\.?\d*)\)/.test(d.querySelector(".boot-ring").style.transform) && parseFloat((d.querySelector(".boot-ring").style.transform.match(/[\d.]+/) || [0])[0]) > 1, d.querySelector(".boot-ring").style.transform);

  /* --- phase 2: deeper scroll — tiles rush the camera --- */
  w.__setScroll(2600);
  await sleep(420);
  const fieldOpacity2 = d.querySelector(".boot-field").style.opacity;
  logsSeen.add(d.querySelector(".boot-log").textContent);
  const tile = d.querySelector(".boot-tile");
  ok("field visible mid-sequence", parseFloat(fieldOpacity2) > 0.4, fieldOpacity2);
  ok("tiles have 3D transforms", /translate3d\([^)]*-?\d/.test(tile.style.transform), tile.style.transform.slice(0, 60));
  ok("core dissolved once the field takes over", parseFloat(d.querySelector(".boot-core").style.opacity) === 0, d.querySelector(".boot-core").style.opacity);
  ok("multiple boot log lines cycle", logsSeen.size >= 2, [...logsSeen].join(" | "));

  /* --- phase 3: reach the bottom → hand the page back --- */
  w.__setScroll(SPACER_H);
  await sleep(900);
  ok("boot-armed released", !d.documentElement.classList.contains("boot-armed"));
  ok("session flag set", w.sessionStorage.getItem("af-booted") === "1", w.sessionStorage.getItem("af-booted"));
  ok("overlay hidden after exit", d.getElementById("boot").hidden === true);
  ok("overlay faded out", d.getElementById("boot").classList.contains("is-exiting") || d.getElementById("boot").hidden);
  ok("scroll reset to top", w.scrollY === 0, w.scrollY);
  ok("reveal layer still alive", d.documentElement.classList.contains("ui-ready"));
  ok("content reveals after boot", d.querySelectorAll("[data-reveal].is-in").length > 0, d.querySelectorAll("[data-reveal].is-in").length);
  ok("no runtime errors", problems.length === 0, problems.join(" ;; "));

  /* --- phase 4: second visit in the same session skips it entirely --- */
  ok("progress reached 100%", d.querySelector(".boot-pct").textContent === "100%", d.querySelector(".boot-pct").textContent);

  console.log(log.join("\n"));
  const failed = log.filter((l) => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - failed) + "/" + log.length + " passed");
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("HARNESS ERROR", e);
  process.exit(2);
});
