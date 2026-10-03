import { useTheme } from "../lib/hooks.js";
import { Button } from "./ui/button.jsx";
import { Symbol } from "./symbol.jsx";

const OPTIONS = [
  { value: "light", label: "Light", symbol: "sun" },
  { value: "dark", label: "Dark", symbol: "moon" },
  { value: "system", label: "Match device", symbol: "desktop" }
];

/** Segmented light / dark / system control. The whole control is one landmark. */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour scheme"
      className="inline-flex items-center gap-0.5 rounded-full bg-surface-sunken p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={
              active
                ? "grid size-8 cursor-pointer place-items-center rounded-full bg-surface text-foreground shadow-h1"
                : "grid size-8 cursor-pointer place-items-center rounded-full text-foreground-faint hover:text-foreground"
            }
          >
            <Symbol name={option.symbol} className="size-4" />
          </button>
        );
      })}
    </div>
  );
}

/** Compact icon-only variant for the sticky bar. */
export function ThemeButton() {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      <Symbol name={theme === "dark" ? "moon" : "sun"} />
    </Button>
  );
}