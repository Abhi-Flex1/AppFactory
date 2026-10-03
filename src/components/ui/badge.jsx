import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

/** Metadata chips. `tone` carries status: ok (shipped), warn (in progress), info (new). */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken text-foreground-muted",
        brand: "bg-brand-soft text-brand-soft-foreground",
        ok: "bg-ok-soft text-ok-foreground",
        warn: "bg-warn-soft text-warn-foreground",
        info: "bg-info-soft text-info-foreground",
        outline: "border border-line-strong text-foreground-muted"
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs"
      }
    },
    defaultVariants: { tone: "neutral", size: "sm" }
  }
);

export function Badge({ className, tone, size, ...props }) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

/** Status dot + label, used wherever a port's verification state is shown. */
export function StatusBadge({ tone = "neutral", children, className }) {
  const dot = { ok: "bg-ok", warn: "bg-warn", info: "bg-info", neutral: "bg-foreground-faint" }[tone];
  return (
    <Badge tone={tone} size="md" className={className}>
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {children}
    </Badge>
  );
}

export { badgeVariants };