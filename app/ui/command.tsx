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
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
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
        <Command className="**:data-cmdk-group-heading:px-fl-2xs **:data-cmdk-group-heading:text-muted-foreground **:data-cmdk-group:px-fl-2xs [&_[data-cmdk-input-wrapper]_svg]:size-fl-sm **:data-cmdk-input:min-h-fl-lg **:data-cmdk-item:p-fl-2xs [&_[data-cmdk-item]_svg]:size-fl-sm **:data-cmdk-group-heading:font-medium [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0">
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
      className="px-fl-2xs flex items-center border-b"
      data-cmdk-input-wrapper=""
    >
      <Search
        aria-hidden="true"
        className="me-fl-2xs size-fl-xs shrink-0 opacity-50"
      />
      <CommandPrimitive.Input
        className={cn(
          "min-h-fl-lg py-fl-2xs placeholder:text-muted-foreground flex w-full rounded-md bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
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
      className={cn("max-h-80 overflow-x-hidden overflow-y-auto", className)}
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
        "p-fl-3xs text-foreground **:data-cmdk-group-heading:px-fl-2xs **:data-cmdk-group-heading:py-fl-3xs **:data-cmdk-group-heading:text-muted-foreground overflow-hidden **:data-cmdk-group-heading:text-xs **:data-cmdk-group-heading:font-medium",
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
      className={cn("-mx-fl-3xs bg-border h-px", className)}
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
        "gap-fl-2xs px-fl-2xs py-fl-3xs data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:size-fl-xs relative flex cursor-default items-center rounded-sm text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        "text-muted-foreground ms-auto text-xs tracking-widest",
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
