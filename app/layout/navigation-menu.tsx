import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { cn } from "~/ui/classes";

function NavigationMenu({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.Root>
  >;
}) {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        "relative z-10 flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.List>
  >;
}) {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-3xs",
        className,
      )}
      role="list"
      {...props}
    />
  );
}

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-lg w-max items-center justify-center gap-3xs rounded-md px-xs py-2xs text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuTrigger({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>
  >;
}) {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDown
        className="relative top-[1px] ms-3xs size-2xs transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.Content>
  >;
}) {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "start-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavLink> & {
  ref?: React.RefObject<React.ComponentRef<typeof NavLink>>;
}) {
  const location = useLocation();

  return (
    <NavigationMenuPrimitive.Link
      active={location.pathname === props.to}
      asChild
    >
      <NavLink
        ref={ref}
        className={cn(navigationMenuTriggerStyle(), className)}
        {...props}
      />
    </NavigationMenuPrimitive.Link>
  );
}

function NavigationMenuViewport({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>
  >;
}) {
  return (
    <div className={cn("absolute start-0 top-full flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          "origin-top-center relative mt-3xs h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
}

function NavigationMenuIndicator({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> & {
  ref?: React.RefObject<
    React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>
  >;
}) {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        "top-full z-[1] flex h-3xs items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2xs rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
