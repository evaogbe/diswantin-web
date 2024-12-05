import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import { cn } from "~/ui/classes";

const Page = forwardRef<
  React.ElementRef<"article">,
  React.JSX.IntrinsicElements["article"] & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "article";

  return (
    <Comp
      className={cn("flex-1 rounded bg-background p-sm pt-2xs", className)}
      ref={ref}
      {...props}
    />
  );
});
Page.displayName = "Page";

const PageHeading = forwardRef<
  React.ElementRef<"h2">,
  React.JSX.IntrinsicElements["h2"]
>(({ className, children, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-display text-3xl font-extrabold leading-tight tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </h2>
));
PageHeading.displayName = "PageHeading";

export { Page, PageHeading };
