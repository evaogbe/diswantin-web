import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "~/ui/classes";
import { Dialog, DialogContent } from "~/ui/dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
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
        <Command className="[&_[data-cmdk-group-heading]]:px-fl-2xs [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 [&_[data-cmdk-group]]:px-fl-2xs [&_[data-cmdk-input-wrapper]_svg]:size-fl-sm [&_[data-cmdk-input]]:min-h-fl-lg [&_[data-cmdk-item]]:p-fl-2xs [&_[data-cmdk-item]_svg]:size-fl-sm">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex items-center border-b px-fl-2xs"
      data-cmdk-input-wrapper=""
    >
      <Search
        aria-hidden="true"
        className="me-fl-2xs size-fl-xs shrink-0 opacity-50"
      />
      <CommandPrimitive.Input
        className={cn(
          "flex min-h-fl-lg w-full rounded-md bg-transparent py-fl-2xs text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-80 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className="py-fl-xs text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-fl-3xs text-foreground [&_[data-cmdk-group-heading]]:px-fl-2xs [&_[data-cmdk-group-heading]]:py-fl-3xs [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-fl-3xs h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-fl-2xs rounded-sm px-fl-2xs py-fl-3xs text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-fl-xs [&_svg]:shrink-0",
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
