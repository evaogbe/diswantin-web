import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/ui/classes";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-fl-2xs text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-fl-xs [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-md bg-transparent",
        outline:
          "rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        segmented:
          "border border-input bg-transparent first:rounded-es-md first:rounded-ss-md last:rounded-ee-md last:rounded-se-md hover:bg-accent hover:text-accent-foreground",
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
