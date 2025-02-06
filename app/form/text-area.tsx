import { cn } from "~/ui/classes";

function TextArea({
  className,
  ...props
}: React.JSX.IntrinsicElements["textarea"]) {
  return (
    <textarea
      className={cn(
        "border-input bg-background p-fl-2xs ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex field-sizing-content min-h-20 w-full resize-none rounded-md border text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { TextArea };
