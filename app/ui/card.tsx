import { cn } from "~/ui/classes";

function Card({ className, ...props }: React.JSX.IntrinsicElements["section"]) {
  return (
    <section
      className={cn(
        "min-w-fit rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.JSX.IntrinsicElements["header"]) {
  return (
    <header
      className={cn("flex flex-col gap-fl-3xs p-fl-sm", className)}
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

function CardTitle({
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
        "text-balance text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

function CardDescription({
  className,
  ...props
}: React.JSX.IntrinsicElements["p"]) {
  return (
    <p
      className={cn("break-words text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.JSX.IntrinsicElements["div"]) {
  return <div className={cn("p-fl-sm pt-0", className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.JSX.IntrinsicElements["footer"]) {
  return (
    <footer
      className={cn("flex items-center p-fl-sm pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
