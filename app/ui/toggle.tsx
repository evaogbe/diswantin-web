import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/ui/classes";

const toggleVariants = cva(
  "gap-fl-2xs ring-offset-background hover:bg-muted hover:text-muted-foreground focus-visible:ring-ring data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:size-fl-xs inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-md bg-transparent",
        outline:
          "border-input hover:bg-accent hover:text-accent-foreground rounded-md border bg-transparent",
        segmented:
          "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent first:rounded-ss-md first:rounded-es-md last:rounded-se-md last:rounded-ee-md",
      },
      size: {
        default: "min-h-fl-lg min-w-fl-lg px-fl-xs py-fl-2xs",
        sm: "min-wfl-md min-h-fl-md p-fl-2xs",
        lg: "min-h-fl-xl min-w-fl-xl px-fl-sm py-fl-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
