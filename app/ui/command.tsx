import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "~/ui/classes";
import { Dialog, DialogContent } from "~/ui/dialog";

function Command({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive>>;
}) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[data-cmdk-group-heading]]:px-2xs [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 [&_[data-cmdk-group]]:px-2xs [&_[data-cmdk-input-wrapper]_svg]:size-sm [&_[data-cmdk-input]]:h-lg [&_[data-cmdk-item]]:p-2xs [&_[data-cmdk-item]_svg]:size-sm">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.Input>>;
}) {
  return (
    <div
      className="flex items-center border-b px-2xs"
      data-cmdk-input-wrapper=""
    >
      <Search
        aria-hidden="true"
        className="me-2xs size-xs shrink-0 opacity-50"
      />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-lg w-full rounded-md bg-transparent py-2xs text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.List>>;
}) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-80 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.Empty>>;
}) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className="py-sm text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.Group>>;
}) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-3xs text-foreground [&_[data-cmdk-group-heading]]:px-2xs [&_[data-cmdk-group-heading]]:py-3xs [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.Separator>>;
}) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("-mx-3xs h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandItem({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
  ref?: React.RefObject<React.ComponentRef<typeof CommandPrimitive.Item>>;
}) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2xs rounded-sm px-2xs py-3xs text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-xs [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.JSX.IntrinsicElements["span"]) {
  return (
    <span
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
