import { cn } from "~/ui/classes";

function Select({
  className,
  ...props
}: React.JSX.IntrinsicElements["select"]) {
  return (
    <select
      className={cn(
        "flex h-fl-lg min-w-32 rounded-md border border-input bg-transparent py-fl-3xs text-base shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
