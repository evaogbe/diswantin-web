import { cn } from "~/ui/classes";

function Card({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["section"]) {
  return (
    <section
      ref={ref}
      className={cn(
        "min-w-fit rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["header"]) {
  return (
    <header
      ref={ref}
      className={cn("flex flex-col space-y-3xs p-sm", className)}
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
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["p"]) {
  return (
    <p
      ref={ref}
      className={cn("break-words text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["div"]) {
  return <div ref={ref} className={cn("p-sm pt-0", className)} {...props} />;
}

function CardFooter({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["footer"]) {
  return (
    <footer
      ref={ref}
      className={cn("flex items-center p-sm pt-0", className)}
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
