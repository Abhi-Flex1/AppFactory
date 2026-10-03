import { cn } from "../lib/cn.js";

/**
 * The section frame used across every page: an 8px-grid band with the
 * HarmonyOS surface ladder and a consistent header rhythm.
 */
export function Section({
  id,
  alt = false,
  inverse = false,
  className,
  children,
  ...props
}) {
  const tone = inverse ? "bg-surface-inverse text-foreground-inverse" : alt ? "bg-surface-subtle" : "bg-surface";
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", tone, className)} {...props}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  id,
  children,
  className,
  inverse = false,
  /** 1 makes this the page's <h1>; every other page keeps a single one. */
  level = 2
}) {
  const Heading = `h${level}`;
  return (
    <header className={cn("mb-8 max-w-3xl sm:mb-12", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
            inverse ? "text-brand-on-inverse" : "text-brand"
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          level === 1 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          inverse ? "text-foreground-inverse" : "text-foreground"
        )}
      >
        {title}
      </Heading>
      {children && (
        <p
          className={cn(
            "mt-3 text-[15px] leading-relaxed",
            inverse ? "text-foreground-inverse-muted" : "text-foreground-muted"
          )}
        >
          {children}
        </p>
      )}
    </header>
  );
}