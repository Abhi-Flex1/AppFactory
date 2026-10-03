import { cn } from "../../lib/cn.js";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-foreground",
        "placeholder:text-foreground-faint hover:border-line-strong focus:border-brand focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

/** Shimmer-free placeholder block — the site ships no animation layer. */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md bg-surface-sunken", className)}
      {...props}
    />
  );
}