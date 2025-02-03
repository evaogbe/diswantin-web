import { Loader2 } from "lucide-react";
import { Button } from "~/ui/button";
import type { ButtonProps } from "~/ui/button";
import { cn } from "~/ui/classes";

export function PendingButton({
  pending,
  pendingText,
  className,
  children,
  ...props
}: ButtonProps & {
  pending: boolean;
  pendingText: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {pending && (
        <Button {...props} className={className} asChild>
          <span role="status">
            <Loader2 aria-hidden="true" className="animate-spin" />
            {pendingText}
          </span>
        </Button>
      )}
      <Button {...props} className={cn(className, pending && "hidden")}>
        {children}
      </Button>
    </>
  );
}
