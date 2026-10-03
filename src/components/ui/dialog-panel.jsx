import { cn } from "../../lib/cn.js";

/**
 * The dialog *panel*: the sheet on phones, a centred panel on wider screens.
 * It is a plain child of <Dialog>, which owns the native <dialog> behaviour.
 */
export function DialogContent({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "af-scroll-y max-h-[inherit] overflow-y-auto overscroll-contain outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-foreground-muted", className)} {...props} />;
}

/** Hairline grip for the sheet presentation; hidden when it is a centred panel. */
export function DialogGrip({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden", className)}
      {...props}
    />
  );
}