import * as React from "react";
import { cn } from "../../lib/cn.js";

/**
 * Segmented control built on plain buttons rather than a headless primitive.
 *
 * Only two things are actually needed here — arrow-key movement between tabs and
 * the correct ARIA wiring — and both are about fifteen lines. That is a fair
 * trade for dropping the primitives library from the bundle.
 */

const TabsContext = React.createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const active = value !== undefined ? value : internal;

  const select = React.useCallback(
    (next) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const context = React.useMemo(() => ({ active, select }), [active, select]);

  return (
    <TabsContext.Provider value={context}>
      <div data-tabs="" {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  const listRef = React.useRef(null);

  // Arrow keys, Home and End move between tabs, per the WAI-ARIA tabs pattern.
  function onKeyDown(event) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const tabs = [...(listRef.current?.querySelectorAll('[role="tab"]') ?? [])];
    if (!tabs.length) return;

    event.preventDefault();
    const current = tabs.indexOf(document.activeElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (current + 1) % tabs.length
            : (current - 1 + tabs.length) % tabs.length;

    tabs[next].focus();
    tabs[next].click();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex w-full items-center gap-1 overflow-x-auto rounded-full bg-surface-sunken p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ className, value, children, ...props }) {
  const { active, select } = React.useContext(TabsContext);
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-selected={selected}
      aria-controls={`panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => select(value)}
      className={cn(
        "flex-1 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
        "text-foreground-muted hover:text-foreground",
        selected && "bg-surface text-foreground shadow-h1",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ className, value, children, ...props }) {
  const { active } = React.useContext(TabsContext);

  // Unselected panels stay unmounted: hidden captures should not download images.
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn("focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}