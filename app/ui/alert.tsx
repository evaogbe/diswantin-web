import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/ui/classes";

const alertVariants = cva(
  "relative w-full scroll-my-[5ex] rounded-lg border p-fl-xs text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-fl-xs [&>svg]:top-fl-xs [&>svg]:text-foreground [&>svg~*]:ps-fl-md",
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
  className,
  variant,
  ...props
}: React.JSX.IntrinsicElements["section"] &
  VariantProps<typeof alertVariants>) {
  return (
    <section
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
      className={cn(
        "mb-fl-3xs text-balance font-medium leading-none tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

function AlertDescription({
  className,
  ...props
}: React.JSX.IntrinsicElements["p"]) {
  return (
    <p
      className={cn("break-words text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
