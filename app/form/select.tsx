import { forwardRef } from "react";
import { cn } from "~/ui/classes";

const NativeSelect = forwardRef<
  HTMLSelectElement,
  React.JSX.IntrinsicElements["select"]
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-lg w-full rounded-md border border-input bg-transparent px-2xs py-3xs text-base shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm",
      className,
    )}
    {...props}
  />
));
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
