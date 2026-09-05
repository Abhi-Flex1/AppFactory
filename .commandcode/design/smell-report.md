# Smell Report — AppFactory

**Mode:** smell
**Date:** 2026-09-05
**Score:** 5/10 — PRESENT
**Verdict:** Needs changes

---

## TL;DR

The design has a strong technical foundation and custom device mockups that ground it in the HarmonyOS domain, but several category reflexes — particularly the blue-violet gradients, the uniform pattern card grid, and the decorative icon toppers — read as generic tech/AI startup rather than a deliberate engineering portfolio. The palette and composition can be guessed from the domain alone.

**Primary recommendation:** Run `/design recolor` to shift the gradient strategy away from the AI-startup default, then `/design relayout` to break the uniform pattern card grid into a more distinctive composition.

---

## Heuristic Scores

| # | Heuristic | Score | Key Finding |
|---|---|---|---|
| 1 | Tech gradient | 0 | Hero text, brand logo, and modal glyph all use blue-violet-indigo gradients — the visual shorthand for "AI startup" |
| 2 | Generic tech hue | 0 | Primary accent #0a59F7 is a predictable tech blue; palette is guessable from domain |
| 3 | Feature tile grid | 0 | Patterns section uses uniform 3-column grid with identical card structure |
| 4 | Icon topper | 0 | Pattern cards have colored icon wrappers above headings with no functional purpose |
| 5 | Accent rail | 1 | No colored stripes detected |
| 6 | Unearned blur | 1 | Backdrop blur is used sparingly and appropriately (navbar, modal) |
| 7 | Stat monument | 1 | No oversized number clusters detected |
| 8 | Bounce everywhere | 1 | Animations are subtle; no excessive elastic easing |
| 9 | Default type | 0 | Plus Jakarta Sans is a common AI-generated default; no project-specific reason given |
| 10 | Center stack | 1 | Hero centering is appropriate for landing page; not systemic |

---

## Findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | MEDIUM | Color | `public/styles.css:332`, `public/styles.css:183`, `public/styles.css:2165` | Hero gradient text uses `linear-gradient(135deg, #0a59f7 0%, #007dff 50%, #4f46e5 100%)`; brand logo uses `linear-gradient(135deg, var(--accent-primary) 0%, #007dff 100%)`; modal glyph uses `linear-gradient(135deg, #0a59f7 0%, #00d0ff 100%)` | Replace with a single-hue treatment or a gradient that references HarmonyOS's actual design language (e.g., coral-red to celestial-blue) rather than the generic AIStartup blue-violet | The blue-violet-indigo gradient is the most common visual reflex for AI/tech startups; it signals "generic tech" rather than "HarmonyOS engineering portfolio" |
| 2 | MEDIUM | Layout | `public/index.html:404-473`, `public/styles.css:1335-1428` | Patterns section uses `.patterns-grid` with 3 identical `.pattern-card` elements, each containing: icon wrapper, title, description, flow diagram, and "Validated In" link | Vary the card sizes and layouts — make one pattern the hero with a larger visual, or use an asymmetric composition that reflects the architectural differences between the three patterns | Uniform grids with equal cards are a template reflex; the three patterns have different complexity levels that should be reflected in their visual weight |
| 3 | LOW | Layout | `public/styles.css:1359-1369`, `public/index.html:408-410`, `public/index.html:431-433`, `public/index.html:453-455` | Each pattern card has a `.pattern-icon-wrap` (colored rounded square) placed above the heading | Remove the icon toppers or replace with actual visual artifacts from each pattern (e.g., a Flutter widget tree, an NAPI bridge diagram, a WebSocket flow) | Icon toppers that repeat with no variation are a template fill pattern |
| 4 | LOW | Type | `public/index.html:14`, `public/styles.css:35` | Primary typeface is "Plus Jakarta Sans" — a popular modern sans-serif with no stated reason for this project | Either document why Plus Jakarta Sans was chosen (e.g., "HarmonyOS Sans fallback") or select a typeface with a stronger tie to the engineering domain | Common AI-generated default; the design system comment mentions "Apple & Huawei HarmonyOS NEXT Guidelines" but Plus Jakarta Sans is neither |

---

## What's Working

- **Custom device mockups:** The phone and tablet mockups with actual UI content (map screen, terminal, chat) are specific to each ported app and could not come from a template
- **Domain-specific copy:** Bundle IDs, API levels, and architecture patterns are concrete and technical
- **Emerald and purple secondary accents:** These provide some differentiation from the mono-blue default
- **Terminal aesthetic in developer section:** The dark terminal box with syntax-colored code is appropriate for the audience

---

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `public/styles.css:148-157` (navbar blur) | Remove frosted glass effect | Backdrop blur on sticky navbars is a platform convention (iOS, HarmonyOS) rather than a generic template reflex |
| `public/styles.css:331-335` (hero gradient) | Remove gradient entirely | Some gradient treatment on hero text is acceptable; the issue is the specific hue choice, not the technique |
| `public/index.html:110-332` (hero centering) | Make hero left-aligned | Centered hero composition is appropriate for a landing page; the issue is the gradient, not the alignment |

---

## Verification

| Check | Command/Observation | Result |
|---|---|---|
| Gradient hue analysis | Inspected all `linear-gradient` declarations in styles.css | 4 instances of blue-violet-indigo gradients found |
| Card grid uniformity | Compared `.pattern-card` HTML structure across all 3 patterns | Identical structure confirmed |
| Icon wrapper purpose | Checked `.pattern-icon-wrap` usage | Decorative only; no functional role |
| Typeface choice | Checked Google Fonts import in index.html | Plus Jakarta Sans confirmed |
| Animation easing | Reviewed all `transition` and `animation` declarations | No excessive bounce/elastic easing found |

---

## Next Modes

- `/design recolor` — Shift the gradient strategy away from AI-startup defaults
- `/design relayout` — Break the uniform pattern card grid into a more distinctive composition
- `/design typeset` — Document or replace the typeface choice with project-specific reasoning
