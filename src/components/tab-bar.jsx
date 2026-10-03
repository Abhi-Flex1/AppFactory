import { Link, useLocation } from "wouter";
import { NAV, isActive } from "../data/nav.js";
import { cn } from "../lib/cn.js";
import { Symbol } from "./symbol.jsx";

/**
 * HarmonyOS bottom tab bar — filled symbol plus label for the active tab,
 * outline for the rest. Phones and small tablets only; the top bar takes over
 * at lg and this disappears.
 */
export function TabBar() {
  const [path] = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {NAV.map((item) => {
          const active = isActive(path, item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium no-underline",
                  active ? "text-brand" : "text-foreground-faint hover:text-foreground-muted"
                )}
              >
                <Symbol name={item.symbol} solid={active} className="size-6" strokeWidth={1.6} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}