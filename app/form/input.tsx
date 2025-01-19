import { cn } from "~/ui/classes";

function Input({
  ref,
  className,
  ...props
}: React.JSX.IntrinsicElements["input"]) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-lg w-full rounded-md border border-input bg-transparent px-2xs py-3xs text-base shadow-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
