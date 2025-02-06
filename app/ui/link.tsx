import { Link as LinkPrimitive } from "react-router";
import { cn } from "~/ui/classes";

function Link({
  className,
  ...props
}: React.ComponentProps<typeof LinkPrimitive>) {
  return (
    <LinkPrimitive
      className={cn(
        "text-link hover:text-link/80 focus-visible:ring-ring underline transition-colors focus-visible:ring-1 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Link };
