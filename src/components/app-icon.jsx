import { cn } from "../lib/cn.js";

/**
 * The app icon: a two-tone gradient tile in the HarmonyOS layered-icon shape,
 * carrying the port's own glyph. Per-port colour comes straight from the data.
 */
export function AppIcon({ app, size = "md", className }) {
  const dimensions = {
    sm: "size-9 text-base",
    md: "size-12 text-xl",
    lg: "size-16 text-3xl",
    xl: "size-20 text-4xl"
  }[size];

  return (
    <span
      aria-hidden="true"
      className={cn("af-icon shrink-0 font-semibold", dimensions, className)}
      style={{ "--af-accent": app.accent, "--af-accent-deep": app.accentDeep }}
    >
      {app.glyph}
    </span>
  );
}