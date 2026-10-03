import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui class combiner. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}