import { useMemo, useState } from "react";
import { useApi } from "../lib/hooks.js";
import { getApps, getShots } from "../lib/api.js";
import { Seo } from "../components/seo.jsx";
import { PortCard, PortCardSkeleton } from "../components/port-card.jsx";
import { Section, SectionHeader } from "../components/section.jsx";
import { Input } from "../components/ui/input.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Symbol } from "../components/symbol.jsx";
import { COMPAT } from "../data/patterns.js";
import { cn } from "../lib/cn.js";

export default function Ports() {
  const apps = useApi(getApps);
  const shots = useApi(getShots);
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState(null);

  const list = useMemo(() => apps.data ?? [], [apps.data]);

  /** Every stack token across the catalogue, most used first. */
  const stacks = useMemo(() => {
    const counts = new Map();
    for (const app of list) {
      for (const tech of app.stack ?? []) counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [list]);

  const captureCounts = useMemo(() => {
    const map = {};
    for (const [id, entry] of Object.entries(shots.data ?? {})) map[id] = entry.count ?? 0;
    return map;
  }, [shots.data]);

  /**
   * Filtering runs client-side over one fetch: instant on every keystroke and no
   * request per key. Terms must all match, across name, stack, category and blurb.
   */
  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return list.filter((app) => {
      if (stack && !(app.stack ?? []).includes(stack)) return false;
      if (!terms.length) return true;
      const hay = [
        app.name,
        app.tagline,
        app.category,
        app.description,
        app.api,
        app.bundle,
        (app.stack ?? []).join(" "),
        (app.features ?? []).join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }, [list, query, stack]);

  const totalShots = Object.values(shots.data ?? {}).reduce((n, e) => n + (e.count ?? 0), 0);

  return (
    <>
      <Seo
        title="The catalogue"
        path="/ports"
        description="Every app AppFactory has ported to OpenHarmony and HarmonyOS — search by name, stack or capability, with each port's verification state and capture count."
      />

      <Section>
        <SectionHeader
          eyebrow="Catalogue"
          title="Every port, in one list"
          id="portsHeading"
          level={1}
        >
          Six ports across maps, social, messaging, media and developer tools. Search by name, stack
          or what the thing does; filter by the stack it is built on.
        </SectionHeader>

        {/* Search + filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl">
            <Symbol
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground-faint"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ports — try “arkts”, “maps”, “video”…"
              aria-label="Search ports"
              className="h-12 pl-11"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={!stack} onClick={() => setStack(null)}>
              All stacks
              <span className="af-tnum ml-1 text-foreground-faint">{list.length}</span>
            </FilterPill>
            {stacks.map(([tech, count]) => (
              <FilterPill
                key={tech}
                active={stack === tech}
                onClick={() => setStack((current) => (current === tech ? null : tech))}
              >
                {tech}
                <span className="af-tnum ml-1 text-foreground-faint">{count}</span>
              </FilterPill>
            ))}
          </div>
        </div>

        <p className="mb-6 text-sm text-foreground-muted" role="status" aria-live="polite">
          {apps.loading
            ? "Loading the catalogue…"
            : `${filtered.length} of ${list.length} ports${totalShots ? ` · ${totalShots} real captures` : ""}`}
          {stack && !apps.loading && (
            <>
              {" "}on{" "}
              <Badge tone="brand" size="md">
                {stack}
              </Badge>
            </>
          )}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.loading && Array.from({ length: 6 }, (_, i) => <PortCardSkeleton key={i} />)}
          {filtered.map((app) => (
            <div key={app.id} className="relative">
              <PortCard app={app} compat={COMPAT.find((c) => c.id === app.id)} headingLevel={2} />
              {captureCounts[app.id] > 0 && (
                <span className="pointer-events-none absolute right-5 top-5">
                  <Badge tone="outline" size="sm">
                    {captureCounts[app.id]} captures
                  </Badge>
                </span>
              )}
            </div>
          ))}
        </div>

        {!apps.loading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-line-strong p-12 text-center">
            <p className="text-base font-medium">No port matches that.</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Try a broader term, or clear the stack filter.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setStack(null);
              }}
            >
              Reset filters
            </Button>
          </div>
        )}

        {apps.error && (
          <div className="rounded-xl border border-line bg-surface p-8 text-center">
            <Symbol name="alert" className="mx-auto size-6 text-warn" />
            <p className="mt-3 font-medium">The catalogue API did not respond.</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Start the server with <code className="font-mono">npm start</code>, or read{" "}
              <a href="/api/apps" className="text-brand hover:underline">
                /api/apps
              </a>{" "}
              directly.
            </p>
          </div>
        )}
      </Section>
    </>
  );
}

function FilterPill({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium",
        active
          ? "bg-brand text-brand-foreground"
          : "bg-surface-sunken text-foreground-muted hover:bg-line hover:text-foreground"
      )}
      {...props}
    >
      {children}
    </button>
  );
}