import { useCallback, useEffect, useRef } from "react";
import { cn } from "../../lib/cn.js";

/**
 * Modal built on the native <dialog> element, which brings focus trapping,
 * Escape handling, page inertness and the top layer for free — all of which
 * Radix Dialog reimplemented in JavaScript.
 *
 * This component owns the behaviour and the sheet/panel layout. `DialogTitle`
 * and `DialogGrip` are exported from dialog-panel.jsx for use inside it.
 */
export function Dialog({ open, onOpenChange, label, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open && !node.open) {
      if (typeof node.showModal === "function") node.showModal();
      else node.setAttribute("open", "");
    } else if (!open && node.open) {
      if (typeof node.close === "function") node.close();
      else node.removeAttribute("open");
    }
  }, [open]);

  // Native <dialog> fires `close` for Escape and for our backdrop click; both
  // route back through the controlled prop.
  const handleClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={handleClose}
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === ref.current) onOpenChange?.(false);
      }}
      className={cn(
        "m-0 max-h-none max-w-none border border-line bg-transparent p-0 text-foreground",
        "backdrop:bg-black/55",
        // Sheet by default; a centred panel once there is room for one.
        "inset-x-0 bottom-0 mt-auto w-full max-h-[88dvh] rounded-t-2xl bg-surface shadow-h3",
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:mt-0",
        "sm:w-[min(42rem,92vw)] sm:max-h-[82dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      )}
    >
      <div className="af-scroll-y max-h-[inherit] overflow-y-auto overscroll-contain">
        {children}
      </div>
    </dialog>
  );
}

export { DialogContent, DialogTitle, DialogDescription, DialogGrip } from "./dialog-panel.jsx";