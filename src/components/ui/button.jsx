import { cloneElement, isValidElement, forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

/**
 * Capsule buttons in the HarmonyOS hierarchy: filled (primary), tonal
 * (secondary), outline and text (tertiary).
 *
 * `asChild` is resolved with a tiny local cloneElement instead of Radix Slot —
 * the only behaviour it provided that we relied on.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium " +
    "whitespace-nowrap select-none cursor-pointer disabled:pointer-events-none disabled:opacity-45 " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        filled: "bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active",
        tonal: "bg-brand-soft text-brand-soft-foreground hover:brightness-97 dark:hover:brightness-125",
        outline: "border border-line-strong bg-transparent text-foreground hover:bg-surface-subtle",
        subtle: "bg-surface-subtle text-foreground hover:bg-surface-sunken",
        ghost: "text-foreground-muted hover:bg-surface-subtle hover:text-foreground",
        link: "h-auto rounded-xs px-0 text-brand hover:text-brand-hover hover:underline"
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-10 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-7 text-[15px] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5"
      }
    },
    defaultVariants: { variant: "filled", size: "md" }
  }
);

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, children, ...props },
  ref
) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (!asChild) {
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }

  // Merge our classes onto the single child element (a Link or an <a>).
  if (!isValidElement(children)) {
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }

  return cloneElement(children, {
    ref,
    ...props,
    className: cn(classes, children.props.className)
  });
});

export { buttonVariants };