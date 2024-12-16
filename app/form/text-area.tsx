import { forwardRef } from "react";
import { cn } from "~/ui/classes";

const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full resize-none rounded-md border border-input bg-background p-2xs text-base ring-offset-background field-sizing-content placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    )}
    {...props}
  />
));
TextArea.displayName = "TextArea";

export { TextArea };
