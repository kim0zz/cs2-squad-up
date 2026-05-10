import * as React from "react";

import { cn } from "@/lib/utils";

function tryShowNativePicker(el: HTMLInputElement) {
  const show = el.showPicker;
  if (typeof show !== "function") return;
  try {
    show.call(el);
  } catch {
    /* unsupported, not user-activated, or picker already open */
  }
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onClick, onFocus, ...props }, ref) => {
    const openPickerIfApplicable = (el: HTMLInputElement) => {
      if (type !== "date" && type !== "time" && type !== "datetime-local") return;
      tryShowNativePicker(el);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-secondary/35 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/70 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
        onClick={(e) => {
          openPickerIfApplicable(e.currentTarget);
          onClick?.(e);
        }}
        onFocus={(e) => {
          openPickerIfApplicable(e.currentTarget);
          onFocus?.(e);
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
