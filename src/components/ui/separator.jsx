import { cn } from "../../lib/cn.js";

/**
 * A separator is a styled element, not a behaviour: a hairline rule, optionally
 * vertical. Radix would only add a `role` and orientation plumbing here.
 */
export function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-line",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}