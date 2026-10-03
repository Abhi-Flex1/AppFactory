import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogGrip, DialogTitle } from "./ui/dialog.jsx";
import { Input } from "./ui/input.jsx";
import { Symbol } from "./symbol.jsx";
import { AppIcon } from "./app-icon.jsx";
import { NAV, SITE } from "../data/nav.js";
import { fuzzy } from "../lib/utils.js";
import { cn } from "../lib/cn.js";

const ACTIONS = [
  { id: "quickstart", label: "Copy the quickstart", hint: "clone · install · start", symbol: "terminal" },
  { id: "github", label: "Open the source on GitHub", hint: SITE.repo.replace("https://", ""), symbol: "github", href: SITE.repo },
  { id: "api", label: "Open the JSON API", hint: "/api/apps", symbol: "code", href: "/api/apps" }
];

/**
 * ⌘K / Ctrl+K palette. A real combobox: the input keeps focus, the list is a
 * listbox, and `aria-activedescendant` points at the highlighted option.
 */
export function CommandPalette({ open, onOpenChange, apps = [] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [, navigate] = useLocation();
  const listRef = useRef(null);
  const optionRefs = useRef([]);

  const results = useMemo(() => {
    const q = query.trim();
    const score = (label) => fuzzy(q, label);

    const ports = apps
      .map((app) => ({
        kind: "port",
        id: app.id,
        label: app.name,
        hint: app.tagline,
        href: `/ports/${app.id}`,
        app,
        score: Math.max(score(app.name), score(app.tagline), score(app.stack.join(" ")), score(app.category))
      }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const pages = NAV.map((item) => ({
      kind: "page",
      id: item.href,
      label: item.label,
      hint: item.href,
      href: item.href,
      symbol: item.symbol,
      score: score(item.label)
    }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score);

    const actions = ACTIONS.map((action) => ({
      ...action,
      kind: "action",
      score: score(action.label) >= 0 && q ? score(action.label) : q ? -1 : 0
    })).filter((r) => r.score >= 0);

    return [...ports, ...pages, ...actions];
  }, [query, apps]);

  // Reset the query and highlight whenever the palette is reopened.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(item) {
    if (!item) return;
    onOpenChange(false);
    if (item.kind === "action") {
      if (item.id === "quickstart") navigator.clipboard?.writeText(SITE.quickstart).catch(() => {});
      else window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self");
      return;
    }
    navigate(item.href);
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    }
  }

  const LABEL = { port: "Ports", page: "Pages", action: "Actions" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} label="Search the site">
      <div onKeyDown={onKeyDown} className="sm:w-[min(36rem,92vw)] sm:self-center">
        <DialogGrip />
        <div className="p-4 sm:p-5">
          <DialogTitle className="sr-only">Search the site</DialogTitle>
          <div className="relative">
            <Symbol
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground-faint"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ports, pages and actions…"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={results[active] ? `palette-${results[active].kind}-${results[active].id}` : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck="false"
              className="h-12 pl-11 pr-11"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] text-foreground-faint">
              ESC
            </kbd>
          </div>

          <ul
            id="palette-list"
            ref={listRef}
            role="listbox"
            aria-label="Results"
            className="mt-4 max-h-[min(22rem,50vh)] space-y-4 overflow-y-auto"
          >
            {results.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-foreground-muted">
                Nothing matches “{query}”.
              </li>
            )}

            {["port", "page", "action"].map((kind) => {
              const group = results.filter((r) => r.kind === kind);
              if (!group.length) return null;
              return (
                <li key={kind}>
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
                    {LABEL[kind]}
                  </p>
                  <ul>
                    {group.map((item) => {
                      const index = results.indexOf(item);
                      const selected = index === active;
                      return (
                        <li key={`${item.kind}-${item.id}`}>
                          <button
                            id={`palette-${item.kind}-${item.id}`}
                            ref={(el) => (optionRefs.current[index] = el)}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onMouseMove={() => setActive(index)}
                            onClick={() => choose(item)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left",
                              selected ? "bg-brand-soft" : "hover:bg-surface-subtle"
                            )}
                          >
                            {item.kind === "port" ? (
                              <AppIcon app={item.app} size="sm" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "grid size-9 shrink-0 place-items-center rounded-lg",
                                  selected ? "text-brand-soft-foreground" : "text-foreground-muted"
                                )}
                              >
                                <Symbol name={item.symbol} />
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block truncate text-sm font-medium",
                                  selected ? "text-brand-soft-foreground" : "text-foreground"
                                )}
                              >
                                {item.label}
                              </span>
                              <span className="block truncate text-xs text-foreground-muted">
                                {item.hint}
                              </span>
                            </span>
                            {selected && <Symbol name="arrowRight" className="size-4 shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[11px] text-foreground-faint">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">⏎</kbd> open
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}