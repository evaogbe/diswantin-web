import { forwardRef } from "react";
import { cn } from "~/ui/classes";

const Input = forwardRef<
  HTMLInputElement,
  React.JSX.IntrinsicElements["input"]
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-lg w-full rounded-md border border-input bg-transparent px-2xs py-3xs text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
