import { Link } from "wouter";
import { NAV, SITE } from "../data/nav.js";
import { Symbol } from "./symbol.jsx";
import { Brand } from "./site-header.jsx";
import { ThemeToggle } from "./theme-toggle.jsx";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-subtle pb-20 pt-14 lg:pb-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-muted">
              A working record of what it actually takes to move a global app onto OpenHarmony and
              HarmonyOS — the seam, the trade-offs, and what is verified versus what is not.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={SITE.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-surface"
              >
                <Symbol name="github" className="size-4" />
                Source
              </a>
              <a
                href="/api/apps"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-surface"
              >
                <Symbol name="code" className="size-4" />
                JSON API
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground-faint">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-foreground-muted hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground-faint">
              The ports
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/ports/reel-edit" className="text-sm text-foreground-muted hover:text-brand">
                  Reel-Edit
                </Link>
              </li>
              <li>
                <Link href="/ports/opengmaps" className="text-sm text-foreground-muted hover:text-brand">
                  OpenGMaps SDK
                </Link>
              </li>
              <li>
                <Link href="/ports/opentwit" className="text-sm text-foreground-muted hover:text-brand">
                  OpenTwit
                </Link>
              </li>
              <li>
                <Link href="/ports/opentwit-web" className="text-sm text-foreground-muted hover:text-brand">
                  OpenTwit Web
                </Link>
              </li>
              <li>
                <Link href="/ports/ohemacs" className="text-sm text-foreground-muted hover:text-brand">
                  OHEmacs
                </Link>
              </li>
              <li>
                <Link href="/ports/whatisit" className="text-sm text-foreground-muted hover:text-brand">
                  WhatIsIt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="max-w-2xl text-[13px] text-foreground-faint">
              Apache-2.0. Each port carries its own upstream licence and attribution — these are
              unofficial clients, not endorsed by the services they talk to.
            </p>
            <p className="af-tnum mt-1.5 text-[13px] text-foreground-faint">
              Built with React, Tailwind and Vite · {new Date().getFullYear()}
            </p>
          </div>
          {/* The three-way control, not the compact toggle: once you override the
              system preference there has to be a way back to following it. */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-[13px] text-foreground-faint">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}