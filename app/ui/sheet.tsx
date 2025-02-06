import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "~/ui/classes";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className,
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "gap-fl-xs bg-background p-fl-sm data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 max-h-svh shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b",
        bottom:
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t",
        start:
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 start-0 w-3/4 min-w-80 border-r sm:max-w-sm",
        end: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 end-0 w-3/4 min-w-80 border-l sm:max-w-sm",
        compact:
          "max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:slide-in-from-right max-sm:inset-x-0 max-sm:bottom-0 max-sm:border-t sm:inset-y-0 sm:end-0 sm:w-3/4 sm:max-w-sm sm:border-l",
      },
    },
    defaultVariants: {
      side: "compact",
    },
  },
);

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>;

function SheetContent({
  side = "compact",
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay>
        <SheetPrimitive.Content
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {children}
          <SheetPrimitive.Close className="end-fl-xs top-fl-xs ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <X className="size-fl-xs" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetOverlay>
    </SheetPortal>
  );
}

const SheetHeader = ({
  className,
  ...props
}: React.JSX.IntrinsicElements["header"]) => (
  <header
    className={cn("gap-fl-2xs flex flex-col max-sm:text-center", className)}
    {...props}
  />
);

const SheetFooter = ({
  className,
  ...props
}: React.JSX.IntrinsicElements["footer"]) => (
  <footer
    className={cn(
      "sm:gap-fl-2xs flex flex-col-reverse sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn(
        "text-foreground text-lg font-semibold text-balance",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-muted-foreground text-sm break-words", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
