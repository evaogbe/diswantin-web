import { cn } from "~/ui/classes";

function TextArea({
  className,
  ...props
}: React.JSX.IntrinsicElements["textarea"]) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full resize-none rounded-md border border-input bg-background p-2xs text-base ring-offset-background field-sizing-content placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { TextArea };
