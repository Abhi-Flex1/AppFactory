import { useCallback, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useApi } from "./lib/hooks.js";
import { getApps } from "./lib/api.js";
import { SiteHeader } from "./components/site-header.jsx";
import { TabBar } from "./components/tab-bar.jsx";
import { SiteFooter } from "./components/site-footer.jsx";
import { CommandPalette } from "./components/command-palette.jsx";
import { Symbol } from "./components/symbol.jsx";

import Home from "./pages/home.jsx";
import Ports from "./pages/ports.jsx";
import PortDetail from "./pages/port-detail.jsx";
import Architecture from "./pages/architecture.jsx";
import Builders from "./pages/builders.jsx";
import NotFound from "./pages/not-found.jsx";

export default function App() {
  const apps = useApi(getApps);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [, navigate] = useLocation();

  const open = useCallback(() => setPaletteOpen(true), []);
  const close = useCallback(() => setPaletteOpen(false), []);

  // ⌘K / Ctrl+K anywhere. The palette is the only keyboard shortcut worth having.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // A ⌘K affordance on touch devices, where there is no keyboard shortcut.
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-foreground"
      >
        Skip to content
      </a>

      <SiteHeader onOpenSearch={open} />

      <main id="main" className="flex-1 pb-16 lg:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/ports/:id" component={PortDetail} />
          <Route path="/ports" component={Ports} />
          <Route path="/architecture" component={Architecture} />
          <Route path="/builders" component={Builders} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <SiteFooter />
      <TabBar />

      {/* Touch-only ⌘K affordance, docked above the tab bar on phones. */}
      <button
        type="button"
        onClick={open}
        aria-label="Search ports, pages and actions"
        className="fixed bottom-20 right-4 z-30 grid size-12 place-items-center rounded-full bg-brand text-brand-foreground shadow-h3 lg:hidden"
      >
        <Symbol name="search" strokeWidth={2} />
      </button>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} apps={apps.data ?? []} />
    </div>
  );
}