import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        "fl-4xs",
        "fl-3xs",
        "fl-2xs",
        "fl-xs",
        "fl-sm",
        "fl-md",
        "fl-lg",
        "fl-xl",
        "fl-2xl",
        "fl-3xl",
        "fl-4xs-3xs",
        "fl-3xs-2xs",
        "fl-2xs-xs",
        "fl-xs-sm",
        "fl-sm-md",
        "fl-md-lg",
        "fl-lg-xl",
        "fl-xl-2xl",
        "fl-2xl-3xl",
        "fl-sm-lg",
        "fl-sm-2xl",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
