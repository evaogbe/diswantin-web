import { forwardRef } from "react";
import { Link as LinkPrimitive } from "react-router";
import { cn } from "~/ui/classes";

const Link = forwardRef<
  React.ElementRef<typeof LinkPrimitive>,
  React.ComponentPropsWithoutRef<typeof LinkPrimitive>
>(({ className, ...props }, ref) => (
  <LinkPrimitive
    ref={ref}
    className={cn(
      "whitespace-nowrap text-link underline transition-colors hover:text-link/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      className,
    )}
    {...props}
  />
));
Link.displayName = "Link";

export { Link };
