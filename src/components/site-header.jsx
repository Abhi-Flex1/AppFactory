import { Link, useLocation } from "wouter";
import { NAV, SITE, isActive } from "../data/nav.js";
import { cn } from "../lib/cn.js";
import { Button } from "./ui/button.jsx";
import { Symbol } from "./symbol.jsx";
import { ThemeButton } from "./theme-toggle.jsx";

/** Wordmark: the layered tile + name, linking home. */
export function Brand({ className }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${SITE.name} — home`}>
      <span
        aria-hidden="true"
        className="af-icon size-8 text-[15px]"
        style={{ "--af-accent": "#0A59F7", "--af-accent-deep": "#08307F" }}
      >
        ▤
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">{SITE.name}</span>
    </Link>
  );
}

/** Sticky top bar — hidden below lg, where the bottom tab bar takes over. */
export function SiteHeader({ onOpenSearch }) {
  const [path] = useLocation();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-surface/85 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-8">
        <Brand />

        <nav aria-label="Primary" className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = isActive(path, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium",
                  active
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "text-foreground-muted hover:bg-surface-subtle hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={onOpenSearch}
            className="h-9 gap-3 pl-3.5 pr-2 font-normal text-foreground-muted"
          >
            <Symbol name="search" className="size-4" />
            Search
            <kbd className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-foreground-faint">
              ⌘K
            </kbd>
          </Button>
          <ThemeButton />
          <Button variant="ghost" size="icon" className="size-9" asChild>
            <a href={SITE.repo} target="_blank" rel="noreferrer" aria-label="AppFactory on GitHub">
              <Symbol name="github" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}