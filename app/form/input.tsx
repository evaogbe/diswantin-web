import { cn } from "~/ui/classes";

function Input({ className, ...props }: React.JSX.IntrinsicElements["input"]) {
  return (
    <input
      className={cn(
        "h-fl-lg border-input px-fl-2xs py-fl-3xs ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border bg-transparent text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
