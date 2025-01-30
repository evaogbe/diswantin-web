import { Link as LinkPrimitive } from "react-router";
import { cn } from "~/ui/classes";

function Link({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LinkPrimitive> & {
  ref?: React.RefObject<React.ComponentRef<typeof LinkPrimitive>>;
}) {
  return (
    <LinkPrimitive
      className={cn(
        "text-link underline transition-colors hover:text-link/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Link };
