import { Slot } from "@radix-ui/react-slot";
import { cn } from "~/ui/classes";

function Page({
  className,
  asChild,
  ...props
}: React.JSX.IntrinsicElements["article"] & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "article";

  return (
    <Comp
      className={cn(
        "flex-1 rounded-sm bg-background p-fl-sm pt-fl-2xs max-sm:min-w-fit",
        className,
      )}
      {...props}
    />
  );
}

function PageHeading({
  className,
  children,
  ...props
}: React.JSX.IntrinsicElements["h2"]) {
  return (
    <h2
      className={cn(
        "text-balance font-display text-3xl font-extrabold leading-tight tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export { Page, PageHeading };
