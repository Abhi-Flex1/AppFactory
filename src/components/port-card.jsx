import { Link } from "wouter";
import { cn } from "../lib/cn.js";
import { AppIcon } from "./app-icon.jsx";
import { Badge, StatusBadge } from "./ui/badge.jsx";
import { Symbol } from "./symbol.jsx";
import { patternFor } from "../data/patterns.js";

/**
 * One port, as a card. The whole tile is a single link — no nested interactive
 * elements — which is also the cheapest accessible target on the page.
 */
export function PortCard({ app, compat, className, compact = false, headingLevel = 3 }) {
  const pattern = patternFor(app.id);
  const Heading = `h${headingLevel}`;

  return (
    <Link
      href={`/ports/${app.id}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-line bg-surface p-5 no-underline shadow-h1",
        "hover:border-brand-line hover:shadow-h2 focus-visible:outline-2 focus-visible:outline-brand",
        className
      )}
    >
      <div className="mb-4 flex items-start gap-4">
        <AppIcon app={app} size={compact ? "md" : "lg"} />
        <div className="min-w-0 flex-1">
          <Heading className="truncate text-lg font-semibold text-foreground">{app.name}</Heading>
          <p className="mt-0.5 text-[13px] leading-snug text-foreground-muted">{app.tagline}</p>
        </div>
        <Symbol
          name="arrowRight"
          className="mt-1 size-4 shrink-0 text-foreground-faint group-hover:text-brand"
        />
      </div>

      <p className="mb-4 text-sm leading-relaxed text-foreground-muted">
        {compact ? app.category : app.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {compat ? (
          <StatusBadge tone={compat.tone}>{compat.verification}</StatusBadge>
        ) : (
          <StatusBadge tone={app.statusTone}>{app.status}</StatusBadge>
        )}
        {pattern && !compact && <Badge tone="outline">{pattern.title}</Badge>}
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
          {app.stack.slice(0, 5).map((tech) => (
            <Badge key={tech} tone="neutral">
              {tech}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}

export function PortCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-start gap-4">
        <div className="size-16 shrink-0 rounded-[22%] bg-surface-sunken" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-surface-sunken" />
          <div className="h-3 w-full rounded bg-surface-sunken" />
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-surface-sunken" />
        <div className="h-3 w-4/5 rounded bg-surface-sunken" />
      </div>
      <div className="mt-auto h-6 w-24 rounded-full bg-surface-sunken" />
    </div>
  );
}