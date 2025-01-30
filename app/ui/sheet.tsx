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
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
  ref?: React.RefObject<React.ComponentRef<typeof SheetPrimitive.Overlay>>;
}) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "fixed z-50 max-h-svh gap-fl-xs bg-background p-fl-sm shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        start:
          "inset-y-0 start-0 w-3/4 min-w-80 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        end: "inset-y-0 end-0 w-3/4 min-w-80 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        compact:
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:border-t max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom sm:inset-y-0 sm:end-0 sm:w-3/4 sm:max-w-sm sm:border-l sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "compact",
    },
  },
);

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> &
  VariantProps<typeof sheetVariants> & {
    ref?: React.RefObject<React.ComponentRef<typeof SheetPrimitive.Content>>;
  };

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
          <SheetPrimitive.Close className="absolute end-fl-xs top-fl-xs rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
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
    className={cn("flex flex-col gap-fl-2xs max-sm:text-center", className)}
    {...props}
  />
);

const SheetFooter = ({
  className,
  ...props
}: React.JSX.IntrinsicElements["footer"]) => (
  <footer
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-fl-2xs",
      className,
    )}
    {...props}
  />
);

function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
  ref?: React.RefObject<React.ComponentRef<typeof SheetPrimitive.Title>>;
}) {
  return (
    <SheetPrimitive.Title
      className={cn(
        "text-balance text-lg font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & {
  ref?: React.RefObject<React.ComponentRef<typeof SheetPrimitive.Description>>;
}) {
  return (
    <SheetPrimitive.Description
      className={cn("break-words text-sm text-muted-foreground", className)}
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
