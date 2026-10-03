import { cn } from "../../lib/cn.js";

/** Panels at the HarmonyOS large-radius scale. */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface shadow-h1",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, as: Tag = "h3", ...props }) {
  return <Tag className={cn("text-base font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-relaxed text-foreground-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center gap-2 p-5 pt-0", className)} {...props} />;
}