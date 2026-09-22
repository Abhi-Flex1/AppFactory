/* AppFactory — motion engine.
   Layer-2 behaviour for ui.css: the spatial boot sequence, scroll reveals,
   tilt + glare cards, magnetic buttons, count-ups, the stacked toast system
   and the ⌘K command palette.

   Design rules:
   - nothing here is required to read the page (progressive enhancement),
   - prefers-reduced-motion disables every continuous animation,
   - the boot sequence runs once per browser session and is always skippable. */
(function () {
  "use strict";

  const root = document.documentElement;
  const AF = window.AF || (window.AF = {});
  const REDUCED = (function () {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  })();
  const mq = function (q) {
    try {
      return window.matchMedia(q).matches;
    } catch (e) {
      return false;
    }
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, t) => {
    const x = clamp((t - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  };
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  /* =====================================================================
     1. Spatial boot sequence — HarmonyOS-style cold boot, scroll driven.
     The page is arm-wrapped by an inline head script; here we own it.
     ===================================================================== */
  const LOG_LINES = [
    "HarmonyOS 6.1.1 · kernel ready",
    "mounting /data · verified boot",
    "loading AppFactory catalogue",
    "5 ports · 2 builders · signed HAPs",
    "starting UI framework"
  ];

  function initBoot() {
    const boot = document.getElementById("boot");
    const spacer = document.getElementById("bootSpacer");
    window.__AF_BOOT_OK = true;

    if (!boot || !spacer || !root.classList.contains("boot-armed") || REDUCED) {
      root.classList.remove("boot-armed");
      if (boot) boot.hidden = true;
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem("af-booted") === "1";
    } catch (e) {
      seen = false;
    }
    if (seen) {
      root.classList.remove("boot-armed");
      boot.hidden = true;
      return;
    }

    /* --- refs ------------------------------------------------------- */
    const core = boot.querySelector(".boot-core");
    const rings = Array.from(boot.querySelectorAll(".boot-ring"));
    const bar = boot.querySelector(".boot-progress i");
    const progressEl = boot.querySelector(".boot-progress");
    const pct = boot.querySelector(".boot-pct");
    const log = boot.querySelector(".boot-log");
    const field = boot.querySelector(".boot-field");
    const floor = boot.querySelector(".boot-floor");
    const flash = boot.querySelector(".boot-flash");
    const hint = boot.querySelector(".boot-hint");
    const skip = boot.querySelector(".boot-skip");
    const canvas = boot.querySelector(".boot-stars");

    /* --- spatial tile field ----------------------------------------- */
    const GLYPHS = ["opengmaps", "opentwit", "opentwit-web", "ohemacs", "whatisit"];
    const LAYOUT = [
      [-430, -210], [400, -250], [-560, 150], [520, 180], [-170, 330],
      [180, -380], [-330, -430], [340, 340], [0, -120], [-640, -60],
      [640, -40], [-60, 470], [90, 190]
    ];
    const tiles = [];
    LAYOUT.forEach((pos, i) => {
      const el = document.createElement("div");
      el.className = "boot-tile" + (i >= GLYPHS.length ? " is-blank" : "");
      if (i < GLYPHS.length) el.innerHTML = AF.iconSVG ? AF.iconSVG(GLYPHS[i], 44) : "";
      field.appendChild(el);
      tiles.push({ el: el, tx: pos[0], ty: pos[1], depth: (i % 5) * 0.5 + 0.4, spin: (i % 2 ? 1 : -1) * (6 + (i % 4) * 3) });
    });

    /* --- starfield --------------------------------------------------- */
    const ctx = canvas ? canvas.getContext("2d") : null;
    let W = 0, H = 0, stars = [];
    function sizeStars() {
      if (!ctx || !canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = boot.clientWidth || window.innerWidth;
      H = boot.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!stars.length) {
        for (let i = 0; i < 170; i++) {
          stars.push({
            x: (Math.random() - 0.5) * 1500,
            y: (Math.random() - 0.5) * 1000,
            z: 60 + Math.random() * 1500,
            c: Math.random() > 0.75 ? "158,214,255" : "226,236,255"
          });
        }
      }
    }
    sizeStars();

    let last = performance.now();
    function drawStars(p, now) {
      if (!ctx) return;
      const dt = Math.min(64, now - last) / 16.67;
      last = now;
      const cx = W / 2, cy = H / 2;
      const speed = (2.2 + p * p * 150) * dt;
      const streak = p > 0.5 ? (p - 0.5) * 2 : 0;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const z0 = s.z;
        s.z -= speed;
        if (s.z < 40) {
          s.z = 1560;
          s.x = (Math.random() - 0.5) * 1500;
          s.y = (Math.random() - 0.5) * 1000;
          continue;
        }
        const k = 420 / s.z;
        const sx = cx + s.x * k;
        const sy = cy + s.y * k;
        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
        const k0 = 420 / Math.min(1700, z0 + speed * (2 + streak * 14));
        const alpha = clamp((1700 - s.z) / 1500, 0, 1) * 0.9;
        const r = clamp((1700 - s.z) / 1100, 0.4, 2.3);
        if (streak > 0.01) {
          ctx.strokeStyle = "rgba(" + s.c + "," + alpha.toFixed(3) + ")";
          ctx.lineWidth = r;
          ctx.beginPath();
          ctx.moveTo(cx + s.x * k0, cy + s.y * k0);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(" + s.c + "," + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    /* --- frame render ------------------------------------------------ */
    let logPhase = -1;
    function render(p) {
      boot.style.setProperty("--p", p.toFixed(4));

      /* core: the camera pushes through the brand mark */
      const coreScale = 1 + smooth(0.12, 0.62, p) * 2.1;
      const coreFade = 1 - smooth(0.5, 0.74, p);
      if (core) {
        core.style.transform = "translateZ(0) scale(" + coreScale.toFixed(3) + ")";
        core.style.opacity = coreFade.toFixed(3);
      }
      for (let i = 0; i < rings.length; i++) {
        const rp = clamp((p - 0.04 - i * 0.055) / 0.55, 0, 1);
        rings[i].style.transform = "scale(" + (0.35 + rp * 3.6).toFixed(3) + ")";
        rings[i].style.opacity = ((1 - rp) * 0.85 * (1 - smooth(0.5, 0.7, p))).toFixed(3);
      }

      /* progress readout — tracks scroll honestly, with a small hold at the end */
      const prog = p < 0.9 ? (p / 0.9) * 0.94 : 0.94 + ((p - 0.9) / 0.1) * 0.06;
      const progPct = Math.round(clamp(prog, 0, 1) * 100);
      if (bar) bar.style.width = progPct + "%";
      if (pct) pct.textContent = progPct + "%";
      if (progressEl && progressEl.getAttribute("aria-valuenow") !== String(progPct)) {
        progressEl.setAttribute("aria-valuenow", String(progPct));
      }
      const phase = p < 0.16 ? 0 : p < 0.34 ? 1 : p < 0.52 ? 2 : p < 0.72 ? 3 : 4;
      if (log && phase !== logPhase) {
        logPhase = phase;
        log.textContent = LOG_LINES[phase];
      }

      /* spatial field: tiles rush the camera between 0.42 → 1 */
      const fp = smooth(0.42, 1, p);
      if (field) field.style.opacity = smooth(0.4, 0.52, p).toFixed(3);
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const z = -3000 + fp * 3900 + t.depth * 140;
        const fade = clamp((z + 3000) / 900, 0, 1) * (1 - smooth(620, 980, z));
        t.el.style.opacity = fade.toFixed(3);
        t.el.style.transform =
          "translate3d(" + t.tx + "px," + t.ty + "px," + z.toFixed(1) + "px) rotateX(" +
          (-t.spin * 0.5).toFixed(2) + "deg) rotateY(" + (t.spin * fp).toFixed(2) + "deg)";
      }

      if (floor) {
        floor.style.opacity = (smooth(0.04, 0.28, p) * (1 - smooth(0.88, 1, p))).toFixed(3);
        floor.style.backgroundPosition = "0 " + (p * 1400).toFixed(1) + "px, 0 " + (p * 1400).toFixed(1) + "px";
      }
      if (flash) flash.style.opacity = (smooth(0.9, 1, p) * 0.95).toFixed(3);
      if (hint) hint.style.opacity = (1 - smooth(0.015, 0.1, p)).toFixed(3);
    }

    /* --- scroll → progress ------------------------------------------ */
    let target = 0, disp = 0, done = false, raf = 0;
    function measure() {
      const max = Math.max(1, spacer.offsetHeight - window.innerHeight);
      target = clamp(window.scrollY / max, 0, 1);
    }

    function finish() {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem("af-booted", "1");
      } catch (e) {}
      cancelAnimationFrame(raf);
      render(1);
      drawStars(1, performance.now());
      root.classList.remove("boot-armed");
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      boot.classList.add("is-exiting");
      if (skip && document.activeElement === skip) {
        try {
          skip.blur();
        } catch (e) {}
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      setTimeout(function () {
        boot.classList.remove("is-live", "is-exiting");
        boot.hidden = true;
      }, 560);
    }

    function onScroll() {
      measure();
    }
    function onResize() {
      sizeStars();
      measure();
      render(disp);
    }
    function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        finish();
      }
    }

    function loop(now) {
      measure();
      disp += (target - disp) * 0.13;
      if (Math.abs(target - disp) < 0.0004) disp = target;
      render(disp);
      drawStars(disp, now);
      if (target >= 0.985) {
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    /* --- start ------------------------------------------------------- */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    boot.hidden = false;
    requestAnimationFrame(function () {
      boot.classList.add("is-live");
    });
    measure();
    render(0);
    if (skip) {
      skip.addEventListener("click", finish);
      /* the dialog owns focus while it is up; hand it back on exit */
      try {
        skip.focus({ preventScroll: true });
      } catch (e) {}
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) finish();
    });
    raf = requestAnimationFrame(loop);
  }

  /* =====================================================================
     2. Scroll reveals + split headlines + grid stagger
     ===================================================================== */
  let revealIO = null;
  const gridSel = ".card-grid,.builder-grid,.pattern-grid,.wall-grid,.shot-grid,.other-grid,.dev-grid,.asset-grid,.stage-body,.preview-grid,.arch-columns,#chapters";

  function makeObserver() {
    if (!("IntersectionObserver" in window)) return null;
    return new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );
  }

  function bindReveal(el) {
    if (el.dataset.revealBound) return;
    el.dataset.revealBound = "1";
    if (!el.getAttribute("data-reveal")) el.setAttribute("data-reveal", "up");
    const delay = el.getAttribute("data-reveal-delay");
    if (delay != null) el.style.setProperty("--rd", delay + "ms");
    else {
      const parent = el.parentElement;
      if (parent && parent.hasAttribute("data-reveal-group")) {
        const idx = Array.prototype.indexOf.call(parent.children, el);
        el.style.setProperty("--rd", Math.min(idx, 8) * 70 + "ms");
      }
    }
    if (revealIO) revealIO.observe(el);
    else el.classList.add("is-in");
  }

  function bindGrid(grid) {
    if (grid.dataset.gridBound) {
      /* keep fresh children staggered after a controller re-renders the grid */
      Array.prototype.forEach.call(grid.children, function (child, i) {
        if (!child.style.getPropertyValue("--sd")) child.style.setProperty("--sd", Math.min(i, 10) * 65 + "ms");
      });
      return;
    }
    grid.dataset.gridBound = "1";
    Array.prototype.forEach.call(grid.children, function (child, i) {
      child.style.setProperty("--sd", Math.min(i, 10) * 65 + "ms");
    });
    if (revealIO) revealIO.observe(grid);
    else grid.classList.add("is-in");
  }

  function bindSplit(el) {
    if (el.dataset.splitBound) return;
    el.dataset.splitBound = "1";
    const text = (el.textContent || "").trim();
    if (!text) return;
    el.setAttribute("aria-label", text);
    el.classList.add("split-text");
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map(function (w, i) {
        return (
          '<span class="word-mask" aria-hidden="true"><span class="split-word" style="--wd:' +
          80 + i * 48 +
          'ms">' +
          w.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
          "</span></span>"
        );
      })
      .join(" ");
    if (revealIO) revealIO.observe(el);
    else el.classList.add("is-in");
  }

  function scanReveals() {
    document.querySelectorAll("[data-reveal]:not([data-reveal-bound])").forEach(bindReveal);
    document.querySelectorAll("[data-split]:not([data-split-bound])").forEach(bindSplit);
    document.querySelectorAll(gridSel).forEach(bindGrid);
    if (window.__syncTablists) window.__syncTablists();
  }
  function initReveals() {
    revealIO = makeObserver();
    scanReveals();
    if ("MutationObserver" in window) {
      let pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          scanReveals();
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  /* =====================================================================
     3. Tilt + glare, spotlight borders, magnetic press, ripples
     ===================================================================== */
  const SPOT_SEL = ".port-card,.builder-card,.step,.chapter,.asset,.builder-profile,.api-card,.other-card";
  let curTilt = null;

  function resetTilt(el) {
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  function initPointerFX() {
    if (REDUCED || !mq("(hover: hover) and (pointer: fine)")) return;

    document.addEventListener(
      "pointermove",
      function (e) {
        const t = e.target.closest ? e.target.closest("[data-tilt]") : null;
        if (t !== curTilt) {
          if (curTilt) resetTilt(curTilt);
          curTilt = t;
          if (t) t.classList.add("is-tilting");
        }
        if (curTilt) {
          const r = curTilt.getBoundingClientRect();
          const px = clamp((e.clientX - r.left) / r.width, 0, 1);
          const py = clamp((e.clientY - r.top) / r.height, 0, 1);
          curTilt.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
          curTilt.style.setProperty("--ry", ((px - 0.5) * 12).toFixed(2) + "deg");
          curTilt.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
          curTilt.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        }

        const s = e.target.closest ? e.target.closest(SPOT_SEL) : null;
        if (s) {
          const r = s.getBoundingClientRect();
          s.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          s.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        }

        const m = e.target.closest ? e.target.closest("[data-magnetic]") : null;
        document.querySelectorAll("[data-magnetic].is-magnetic").forEach(function (el) {
          if (el === m) return;
          el.style.transform = "";
        });
        if (m) {
          const r = m.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          m.classList.add("is-magnetic");
          m.style.transform = "translate(" + (dx * 9).toFixed(2) + "px," + (dy * 7).toFixed(2) + "px)";
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      if (curTilt) resetTilt(curTilt);
      curTilt = null;
      document.querySelectorAll("[data-magnetic].is-magnetic").forEach(function (el) {
        el.style.transform = "";
      });
    });

    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target.closest ? e.target.closest(".btn") : null;
        if (!btn || btn.classList.contains("btn--text")) return;
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2.1;
        const rip = document.createElement("span");
        rip.className = "ripple";
        rip.style.width = rip.style.height = size + "px";
        rip.style.left = e.clientX - r.left - size / 2 + "px";
        rip.style.top = e.clientY - r.top - size / 2 + "px";
        btn.appendChild(rip);
        setTimeout(function () {
          rip.remove();
        }, 640);
      },
      true
    );
  }

  /* =====================================================================
     4. Count-ups
     ===================================================================== */
  function initCounters() {
    const nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length) return;
    const run = function (el) {
      const to = parseFloat(el.getAttribute("data-count"));
      const dec = parseInt(el.getAttribute("data-count-dec") || "0", 10);
      const suffix = el.getAttribute("data-count-suffix") || "";
      if (REDUCED || isNaN(to)) {
        el.textContent = to.toFixed(dec) + suffix;
        return;
      }
      const dur = 1250;
      const t0 = performance.now();
      const step = function (now) {
        const t = clamp((now - t0) / dur, 0, 1);
        el.textContent = (to * easeOutExpo(t)).toFixed(dec) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          run(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.4 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* =====================================================================
     5. Scroll progress hairline + nav gliding pill
     ===================================================================== */
  function initScrollBar() {
    const sp = document.createElement("div");
    sp.className = "scroll-progress";
    sp.setAttribute("aria-hidden", "true");
    document.body.appendChild(sp);
    let ticking = false;
    const update = function () {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      sp.style.transform = "scaleX(" + clamp(window.scrollY / max, 0, 1).toFixed(4) + ")";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  function initNavPill() {
    if (!mq("(min-width:1024px)")) return;
    document.querySelectorAll(".nav-links").forEach(function (nav) {
      const pill = document.createElement("span");
      pill.className = "nav-pill";
      pill.setAttribute("aria-hidden", "true");
      nav.appendChild(pill);
      const links = Array.from(nav.querySelectorAll("a"));
      const active = nav.querySelector('a[aria-current="page"]');

      const moveTo = function (link, show) {
        if (!link) {
          pill.classList.remove("is-on");
          return;
        }
        pill.style.left = link.offsetLeft + "px";
        pill.style.width = link.offsetWidth + "px";
        pill.style.top = link.offsetTop + link.offsetHeight / 2 + "px";
        pill.classList.add("is-on");
        if (!show) pill.style.opacity = "";
      };

      links.forEach(function (link) {
        link.addEventListener("pointerenter", function () {
          moveTo(link, true);
        });
      });
      nav.addEventListener("pointerleave", function () {
        moveTo(active, false);
        if (!active) pill.classList.remove("is-on");
      });
      if (active) requestAnimationFrame(function () {
        moveTo(active, true);
        pill.style.opacity = "";
      });
    });
  }

  /* =====================================================================
     6. Stacked toasts
     ===================================================================== */
  function initToasts() {
    const legacy = document.getElementById("toast");
    if (legacy) legacy.classList.add("is-legacy");

    AF.toast = function (message) {
      let stack = document.querySelector(".toast-stack");
      if (!stack) {
        stack = document.createElement("div");
        stack.className = "toast-stack";
        document.body.appendChild(stack);
      }
      const el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.textContent = message;
      stack.appendChild(el);
      let killed = false;
      const kill = function () {
        if (killed) return;
        killed = true;
        el.classList.add("is-out");
        setTimeout(function () {
          el.remove();
        }, 340);
      };
      el.addEventListener("click", kill);
      setTimeout(kill, 2700);
      while (stack.children.length > 3) stack.firstElementChild.remove();
    };
  }

  /* =====================================================================
     7. Command palette (⌘K / Ctrl+K)
     ===================================================================== */
  const ICON_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M3.6 10.6 12 3.6l8.4 7v9.2a1.2 1.2 0 0 1-1.2 1.2h-4.6v-6h-5.2v6H4.8a1.2 1.2 0 0 1-1.2-1.2z"/></svg>';
  const ICON_GRID = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7.4" height="7.4" rx="2"/><rect x="13.6" y="3" width="7.4" height="7.4" rx="2"/><rect x="3" y="13.6" width="7.4" height="7.4" rx="2"/><rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2"/></svg>';
  const ICON_LAYERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2.6 21.4 8 12 13.4 2.6 8z"/><path d="M4.6 12.4 12 16.6l7.4-4.2 2 1.1-9.4 5.3-9.4-5.3z"/></svg>';
  const ICON_USERS = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8.4" r="3.8"/><path d="M2.6 20.4c0-3.4 2.9-5.6 6.4-5.6s6.4 2.2 6.4 5.6z"/><circle cx="17.4" cy="9.6" r="2.8"/><path d="M16.4 14.6c3 0 5.2 2 5.2 4.8h-4.4"/></svg>';
  const ICON_CODE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8.5 6 3 12l5.5 6"/><polyline points="15.5 6 21 12l-5.5 6"/></svg>';
  const ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.6"/><path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H6.6A3.6 3.6 0 0 0 3 6.6v5.8A2.6 2.6 0 0 0 5.6 15"/></svg>';
  const ICON_GIT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.43 2.87 8.18 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 2.5-.34c.85 0 1.71.12 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>';

  function paletteItems() {
    const ports = [
      { id: "opengmaps", name: "OpenGMaps SDK", sub: "Google Maps SDK · OpenHarmony 5.0.1 · API 12" },
      { id: "opentwit", name: "OpenTwit", sub: "Native ArkTS X client · HarmonyOS 6.1.1" },
      { id: "opentwit-web", name: "OpenTwit Web", sub: "x.com in a native shell · v1.0.0 signed HAP" },
      { id: "ohemacs", name: "OHEmacs", sub: "GNU Emacs 30.1 · NAPI + EGL surface" },
      { id: "whatisit", name: "WhatIsIt", sub: "Native WhatsApp client · Go companion server" }
    ].map(function (p) {
      return {
        group: "Ports",
        title: p.name,
        sub: p.sub,
        icon: AF.appIcon ? AF.appIcon({ id: p.id, name: p.name }, 32) : "",
        href: "/apps/" + p.id
      };
    });

    const pages = [
      { t: "Home", s: "Hero, device stage and catalogue", h: "/", i: ICON_HOME },
      { t: "All ports", s: "Searchable catalogue with release assets", h: "/apps", i: ICON_GRID },
      { t: "Architecture", s: "The five porting patterns and trade-offs", h: "/architecture", i: ICON_LAYERS },
      { t: "Builders", s: "Maintainers behind every port", h: "/builders", i: ICON_USERS },
      { t: "Developers", s: "Run the site locally · JSON API", h: "/#developers", i: ICON_CODE }
    ].map(function (p) {
      return { group: "Pages", title: p.t, sub: p.s, icon: '<span class="cmd-ico">' + p.i + "</span>", href: p.h };
    });

    const actions = [
      {
        group: "Actions",
        title: "Copy quickstart",
        sub: "git clone … && npm install && npm start",
        icon: '<span class="cmd-ico">' + ICON_COPY + "</span>",
        run: function () {
          AF.copy(
            "git clone https://github.com/Abhi-Flex1/AppFactory.git && cd AppFactory && npm install && npm start",
            "Quickstart copied"
          );
        }
      },
      {
        group: "Actions",
        title: "Open source on GitHub",
        sub: "Abhi-Flex1/AppFactory",
        icon: '<span class="cmd-ico">' + ICON_GIT + "</span>",
        href: "https://github.com/Abhi-Flex1/AppFactory"
      }
    ];

    return pages.concat(ports, actions);
  }

  function fuzzy(q, text) {
    if (!q) return { ok: true, score: 0, marks: [] };
    const t = text.toLowerCase();
    const lower = q.toLowerCase();
    let qi = 0, score = 0, last = -2, marks = [];
    for (let i = 0; i < t.length && qi < lower.length; i++) {
      if (t[i] === lower[qi]) {
        marks.push(i);
        score += i === last + 1 ? 3 : 1;
        last = i;
        qi++;
      }
    }
    if (qi < lower.length) return { ok: false };
    if (t.indexOf(lower) === 0) score += 8;
    return { ok: true, score: score, marks: marks };
  }

  function highlight(text, marks) {
    if (!marks.length) return escapeHTML(text);
    let out = "", prev = 0;
    for (let i = 0; i < text.length; i++) {
      if (marks.indexOf(i) !== -1) {
        out += escapeHTML(text.slice(prev, i)) + "<mark>" + escapeHTML(text[i]) + "</mark>";
        prev = i + 1;
      }
    }
    return out + escapeHTML(text.slice(prev));
  }

  function escapeHTML(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function initPalette() {
    const ITEMS = paletteItems();
    const wrap = document.createElement("div");
    wrap.className = "cmd";
    wrap.id = "cmd";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="cmd-backdrop" data-close></div>' +
      '<div class="cmd-panel" role="dialog" aria-modal="true" aria-label="Command palette">' +
      '<div class="cmd-input-row">' +
      '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7.4"/><path d="M16.4 16.4 21 21" stroke-linecap="round"/></svg>' +
      '<input id="cmdInput" type="text" role="combobox" aria-expanded="true" aria-controls="cmdList" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search ports, pages and actions…" />' +
      "<kbd>esc</kbd></div>" +
      '<ul class="cmd-list" id="cmdList" role="listbox" aria-label="Results"></ul>' +
      '<div class="cmd-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span><span><kbd>⌘K</kbd> anywhere</span></div>' +
      "</div>";
    document.body.appendChild(wrap);

    const input = wrap.querySelector("#cmdInput");
    const list = wrap.querySelector("#cmdList");
    let results = [];
    let active = 0;
    let lastFocus = null;

    function render() {
      const q = input.value.trim();
      const groups = ["Pages", "Ports", "Actions"];
      let html = "";
      results = [];
      groups.forEach(function (g) {
        const matched = ITEMS.filter(function (it) {
          if (it.group !== g) return false;
          const r = fuzzy(q, it.title + " " + it.sub);
          it._r = r;
          return r.ok;
        }).sort(function (a, b) {
          return b._r.score - a._r.score;
        });
        if (!matched.length) return;
        html += '<li class="cmd-group" role="presentation">' + g + "</li>";
        matched.forEach(function (it) {
          const idx = results.length;
          results.push(it);
          html +=
            '<li class="cmd-item' + (idx === active ? " is-active" : "") + '" role="option" id="cmd-o' +
            idx + '" aria-selected="' + (idx === active) + '" data-i="' + idx + '">' +
            it.icon +
            '<span class="cmd-txt"><b>' + highlight(it.title, it._r.marks) + "</b><span>" +
            escapeHTML(it.sub) + "</span></span>" +
            '<span class="cmd-go">↵</span></li>';
        });
      });
      if (!results.length) html = '<li class="cmd-empty" role="presentation">No matches for “' + escapeHTML(q) + '”</li>';
      list.innerHTML = html;
      if (active >= results.length) active = Math.max(0, results.length - 1);
      syncActive();
    }

    function syncActive() {
      list.querySelectorAll(".cmd-item").forEach(function (el) {
        const on = Number(el.dataset.i) === active;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", String(on));
        if (on) {
          input.setAttribute("aria-activedescendant", el.id);
          const r = el.getBoundingClientRect();
          const lr = list.getBoundingClientRect();
          if (r.top < lr.top || r.bottom > lr.bottom) el.scrollIntoView({ block: "nearest" });
        }
      });
    }

    function open() {
      if (!wrap.hidden) return;
      /* never interrupt the boot sequence — it owns scroll and the z-stack */
      if (root.classList.contains("boot-armed")) return;
      lastFocus = document.activeElement;
      wrap.hidden = false;
      input.value = "";
      active = 0;
      render();
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () {
        input.focus();
      });
    }

    function close() {
      if (wrap.hidden) return;
      wrap.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function go(i) {
      const it = results[i];
      if (!it) return;
      close();
      if (it.run) {
        it.run();
        return;
      }
      if (it.href) {
        if (it.href.charAt(0) === "/" && it.href.indexOf("/#") === -1 && location.pathname + location.search === it.href) {
          close();
          return;
        }
        location.href = it.href;
      }
    }

    input.addEventListener("input", function () {
      active = 0;
      render();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        active = Math.min(results.length - 1, active + 1);
        syncActive();
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        active = Math.max(0, active - 1);
        syncActive();
      } else if (e.key === "Enter") {
        e.preventDefault();
        go(active);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });
    list.addEventListener("mousemove", function (e) {
      const li = e.target.closest(".cmd-item");
      if (!li) return;
      const i = Number(li.dataset.i);
      if (i !== active) {
        active = i;
        syncActive();
      }
    });
    list.addEventListener("click", function (e) {
      const li = e.target.closest(".cmd-item");
      if (li) go(Number(li.dataset.i));
    });
    wrap.addEventListener("mousedown", function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute("data-close")) close();
    });

    document.addEventListener("keydown", function (e) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        if (root.classList.contains("boot-armed")) return;
        wrap.hidden ? open() : close();
      } else if (e.key === "Escape" && !wrap.hidden) {
        close();
      }
    });
    document.querySelectorAll(".cmd-trigger").forEach(function (b) {
      b.addEventListener("click", open);
    });
    /* the trigger lives in the hidden navbar while the boot is armed */
  }

  /* =====================================================================
     8. Marquee duplication
     ===================================================================== */
  function initMarquee() {
    document.querySelectorAll(".marquee").forEach(function (m) {
      if (m.dataset.marqueeBound) return;
      m.dataset.marqueeBound = "1";
      const track = m.querySelector(".marquee-track");
      const group = m.querySelector(".marquee-group");
      if (track && group && track.children.length === 1) {
        track.appendChild(group.cloneNode(true));
      }
    });
  }

  /* =====================================================================
     10. Scroll depth, press feedback, dark-band bloom, sheet physics
     ===================================================================== */
  function initParallax() {
    if (REDUCED) return;
    const items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;
    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) continue;
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.06;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--py", (-c * speed * vh).toFixed(1) + "px");
      }
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  }

  function initPressFeedback() {
    document.addEventListener("click", function (e) {
      const p = e.target.closest ? e.target.closest(".pill,.stage-tab,.gal-tab,.cmd-trigger") : null;
      if (!p || REDUCED) return;
      p.classList.remove("is-popping");
      void p.offsetWidth;
      p.classList.add("is-popping");
      setTimeout(function () {
        p.classList.remove("is-popping");
      }, 460);
    });
  }

  function initBandBloom() {
    if (REDUCED || !mq("(hover: hover) and (pointer: fine)")) return;
    document.querySelectorAll(".band--dark").forEach(function (band) {
      band.addEventListener(
        "pointermove",
        function (e) {
          const r = band.getBoundingClientRect();
          band.style.setProperty("--sx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          band.style.setProperty("--sy", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    });
  }

  function initSheet() {
    const modal = document.getElementById("modal");
    if (!modal) return;
    const card = modal.querySelector(".modal-card");
    if (!card) return;
    const grip = document.createElement("span");
    grip.className = "sheet-grip";
    grip.setAttribute("aria-hidden", "true");
    card.insertBefore(grip, card.firstChild);

    let startY = 0, dy = 0, dragging = false;
    grip.addEventListener("pointerdown", function (e) {
      dragging = true;
      startY = e.clientY;
      dy = 0;
      try {
        grip.setPointerCapture(e.pointerId);
      } catch (err) {}
      card.classList.add("is-dragging");
      e.preventDefault();
    });
    grip.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      card.style.transform = "translateY(" + dy + "px) scale(" + (1 - Math.min(dy, 200) / 2600).toFixed(4) + ")";
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      if (dy > 110) {
        card.classList.add("is-dismissing");
        const close = document.getElementById("modalClose");
        if (close) close.click();
        setTimeout(function () {
          card.classList.remove("is-dismissing");
        }, 320);
      }
      dy = 0;
    }
    grip.addEventListener("pointerup", release);
    grip.addEventListener("pointercancel", release);
  }

  /* =====================================================================
     11. Tablist keyboard support + roving tabindex (ARIA authoring practice)
     ===================================================================== */
  function syncTablists(scope) {
    const lists = (scope || document).querySelectorAll('[role="tablist"]');
    lists.forEach(function (list) {
      const tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      const anySelected = tabs.some(function (t) {
        return t.getAttribute("aria-selected") === "true";
      });
      /* nothing selected yet (controller still rendering): keep them all tabbable */
      if (!anySelected) {
        tabs.forEach(function (t) {
          t.tabIndex = 0;
        });
        return;
      }
      tabs.forEach(function (t) {
        t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      });
    });
  }

  function initTabKeys() {
    window.__syncTablists = syncTablists;
    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const key = e.key;
      if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
      const tab = e.target.closest ? e.target.closest('[role="tab"]') : null;
      if (!tab) return;
      const list = tab.closest('[role="tablist"]');
      if (!list) return;
      const tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      let i = tabs.indexOf(tab);
      if (i < 0 || tabs.length < 2) return;
      e.preventDefault();
      if (key === "ArrowRight") i = (i + 1) % tabs.length;
      else if (key === "ArrowLeft") i = (i - 1 + tabs.length) % tabs.length;
      else if (key === "Home") i = 0;
      else i = tabs.length - 1;
      const next = tabs[i];
      next.focus();
      next.click(); /* reuses whatever activation logic the controller wired */
      syncTablists();
    });
    syncTablists();
  }

  /* =====================================================================
     Boot
     ===================================================================== */
  function start() {
    initBoot();
    initToasts();
    initReveals();
    initCounters();
    initScrollBar();
    initNavPill();
    initPointerFX();
    initPalette();
    initMarquee();
    initParallax();
    initPressFeedback();
    initBandBloom();
    initSheet();
    initTabKeys();
    root.classList.add("ui-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
