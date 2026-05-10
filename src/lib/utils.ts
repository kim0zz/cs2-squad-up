import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Subtle lime top edge on narrow viewports; sm+ matches standard card border weight. */
export const mobileCardTopAccent = "border-t-2 border-t-primary/25 sm:border-t sm:border-border/80";

/** Tasteful lime focus ring on primary actions (mobile only). */
export const mobilePrimaryCtaRing =
  "ring-2 ring-primary/30 ring-offset-2 ring-offset-background sm:ring-0 sm:ring-offset-0";

/** Slightly softer ring for outline-style primary actions on mobile. */
export const mobileOutlineCtaRing =
  "ring-1 ring-primary/30 ring-offset-2 ring-offset-background sm:ring-0 sm:ring-offset-0";
