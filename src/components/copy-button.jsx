import { useFlash } from "../lib/hooks.js";
import { Button } from "./ui/button.jsx";
import { Symbol } from "./symbol.jsx";

/**
 * Copy-to-clipboard with inline confirmation. Falls back to a hidden textarea
 * when the async Clipboard API is unavailable (older Safari, insecure origins).
 */
export function CopyButton({
  text,
  label = "Copy",
  copied = "Copied",
  variant = "outline",
  size = "sm",
  className,
  onCopied
}) {
  const [done, flash] = useFlash();
  // Icon-only usage passes label="", so the name has to come from somewhere else.
  const accessibleName = label || `Copy ${copied.toLowerCase()}`;

  async function copy() {
    const legacy = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        flash();
        onCopied?.();
      } catch {
        flash();
      }
      area.remove();
    };

    try {
      await navigator.clipboard.writeText(text);
      flash();
      onCopied?.();
    } catch {
      legacy();
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={copy}
      aria-label={label ? undefined : accessibleName}
      aria-live="polite"
    >
      <Symbol name={done ? "check" : "copy"} />
      {done ? copied : label}
    </Button>
  );
}