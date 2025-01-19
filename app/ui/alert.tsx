import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/ui/classes";

const alertVariants = cva(
  "relative w-full rounded-lg border p-xs text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-xs [&>svg]:top-xs [&>svg]:text-foreground [&>svg~*]:ps-md",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 bg-background text-success dark:border-success [&>svg]:text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  ref,
  className,
  variant,
  ...props
}: React.JSX.IntrinsicElements["section"] &
  VariantProps<typeof alertVariants>) {
  return (
    <section
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

const headings = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

function AlertTitle({
  ref,
  className,
  children,
  level = 3,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.RefObject<HTMLHeadingElement>;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const Comp = headings[level];

  return (
    <Comp
      ref={ref}
      className={cn(
        "mb-3xs font-medium leading-none tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

function AlertDescription({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["p"]) {
  return (
    <p
      ref={ref}
      className={cn("text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
