import { cn } from "~/ui/classes";

function Select({
  className,
  ...props
}: React.JSX.IntrinsicElements["select"]) {
  return (
    <select
      className={cn(
        "h-fl-lg border-input py-fl-3xs ring-offset-background focus-visible:ring-ring flex min-w-32 rounded-md border bg-transparent text-base shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
