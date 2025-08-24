"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@workspace/ui/components/navigation-menu";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Menu, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle.tsx";
import { LinkLike } from '@workspace/store/types/global.ts'
import { canSee, GlobalNavConfig, isActive, NavItem, NavRole } from '@workspace/store/utils/nav'

/* ---------- Public API ---------- */
export interface GlobalNavCoreProps {
  config: GlobalNavConfig;
  role?: NavRole;
  pathname: string;             // injected by framework adapter
  LinkComponent: LinkLike;      // injected by framework adapter (e.g. next/link)
  rightSlot?: React.ReactNode;
}

export function GlobalNavCore({
  config,
  role,
  pathname,
  LinkComponent,
  rightSlot,
}: GlobalNavCoreProps) {
  // When any desktop child link is clicked, bump this to force-close open menus
  const [desktopMenuReset, setDesktopMenuReset] = React.useState(0);
  const handleAnyNavigate = React.useCallback(() => {
    // Close any desktop NavigationMenu popovers by remounting it
    setDesktopMenuReset((k) => k + 1);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-3 sm:px-4">
        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNav
            config={config}
            role={role}
            LinkComponent={LinkComponent}
            onNavigate={handleAnyNavigate}
          />
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <LinkComponent href={config.brand.href ?? "/"} className="flex items-center gap-2">
            {config.brand.logoSrc ?? null}
            <span className="font-semibold hidden md:block">{config.brand.name}</span>
          </LinkComponent>
          <ThemeToggle />
        </div>

        {/* Desktop primary */}
        <div className="ml-4 hidden lg:block">
          <DesktopPrimary
            key={desktopMenuReset /* remount to close */}
            items={config.primary}
            pathname={pathname}
            role={role}
            LinkComponent={LinkComponent}
            onNavigate={handleAnyNavigate}
          />
        </div>
        {/* Right */}
        <div className="ml-auto items-center gap-2 hidden lg:block">
          <DesktopSecondary
            key={desktopMenuReset /* remount to close */}
            items={config.secondary || []}
            pathname={pathname}
            role={role}
            LinkComponent={LinkComponent}
            onNavigate={handleAnyNavigate}
          />
          {rightSlot}
        </div>
      </div>
    </header>
  );
}

/* ---------- Desktop ---------- */
function DesktopPrimary({
  items,
  pathname,
  role,
  LinkComponent,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  role?: NavRole;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.filter((i) => canSee(i, role)).map((item) => {
          const active = isActive(item.href, pathname);

          if (item.children?.length) {
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger className={cn(active && "text-foreground")}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-1 p-2 sm:w-[500px]">
                    {item.children
                      .filter((i) => canSee(i, role))
                      .map((child) => (
                        <NavLink
                          key={child.label}
                          LinkComponent={LinkComponent}
                          item={child}
                          className="group flex items-center justify-between rounded-md p-2 hover:bg-accent"
                          onNavigate={onNavigate}
                        >
                          <div className="flex items-center gap-2">
                            {child.icon ? <child.icon className="h-4 w-4" /> : null}
                            <span className="text-sm">{child.label}</span>
                            {child.badge ? (
                              <Badge variant="secondary" className="ml-1">
                                {child.badge}
                              </Badge>
                            ) : null}
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
                        </NavLink>
                      ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild>
                <NavLink
                  LinkComponent={LinkComponent}
                  item={item}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                  onNavigate={onNavigate}
                >
                  {item.label}
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* ---------- Desktop ---------- */
function DesktopSecondary({
  items,
  pathname,
  role,
  LinkComponent,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  role?: NavRole;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  return (
    <NavigationMenu className="relative z-50">
      <NavigationMenuList>
        {items.filter((i) => canSee(i, role)).map((item) => {
          const active = isActive(item.href, pathname);

          if (item.children?.length) {
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger className={cn(active && "text-foreground")}>
                  {item.label}
                </NavigationMenuTrigger>

                <NavigationMenuContent className="z-50">
                  <div className="grid w-[100px] gap-1 p-2 sm:w-[180px]">
                    {item.children
                      .filter((i) => canSee(i, role))
                      .map((child) => (
                        <NavLink
                          key={child.label}
                          LinkComponent={LinkComponent}
                          item={child}
                          className="group flex items-center justify-between rounded-md p-2 hover:bg-accent"
                          onNavigate={onNavigate}
                        >
                          <div className="flex items-center gap-2">
                            {child.icon ? <child.icon className="h-4 w-4" /> : null}
                            <span className="text-sm">{child.label}</span>
                            {child.badge ? (
                              <Badge variant="secondary" className="ml-1">
                                {child.badge}
                              </Badge>
                            ) : null}
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
                        </NavLink>
                      ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild>
                <NavLink
                  LinkComponent={LinkComponent}
                  item={item}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                  onNavigate={onNavigate}
                >
                  {item.label}
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>

      {/* IMPORTANT for each separate menu instance */}
      <NavigationMenuViewport className="absolute left-0 top-full mt-1 w-full" />
    </NavigationMenu>
  );
}


/* ---------- Mobile ---------- */
function MobileNav({
  config,
  role,
  LinkComponent,
  onNavigate,
}: {
  config: GlobalNavConfig;
  role?: NavRole;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = React.useCallback(() => {
    setOpen(false); // close the sheet
    onNavigate(); // also trigger desktop menu reset for consistency
  }, [onNavigate]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2">
            {config.brand.logoSrc ?? null}
            {config.brand.name}
          </SheetTitle>
        </SheetHeader>
        <nav className="px-2 pb-4">
          {config.primary.filter((i) => canSee(i, role)).map((item) => (
            <div key={item.label}>
              <MobileNavItem
                item={item}
                LinkComponent={LinkComponent}
                role={role}
                onNavigate={handleNavigate}
              />
            </div>
          ))}
          {config.secondary && config.secondary.some((i) => canSee(i, role)) && (
            <>
              <Separator className="my-3" />
              <div className="space-y-1">
                {config.secondary
                  .filter((i) => canSee(i, role))
                  .map((item) => (
                    <MobileNavItem
                      key={item.label}
                      item={item}
                      LinkComponent={LinkComponent}
                      role={role}
                      onNavigate={handleNavigate}
                    />
                  ))}
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavItem({
  item,
  role,
  LinkComponent,
  onNavigate,
}: {
  item: NavItem;
  role?: NavRole;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  const content = (
    <div className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent">
      <div className="flex items-center gap-2">
        {item.icon ? <item.icon className="h-4 w-4" /> : null}
        <span className="text-sm">{item.label}</span>
        {item.badge ? (
          <Badge className="ml-1" variant="secondary">
            {item.badge}
          </Badge>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 opacity-50" />
    </div>
  );

  if (item.children?.length) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full">{content}</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[260px]">
          <DropdownMenuLabel className="text-muted-foreground">{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children
            .filter((c) => canSee(c, role))
            .map((c) => (
              <DropdownMenuItem key={c.label} asChild>
                <NavLink LinkComponent={LinkComponent} item={c} onNavigate={onNavigate} className="flex items-center gap-2">
                  {c.icon ? <c.icon className="h-4 w-4" /> : null}
                  <span>{c.label}</span>
                  {c.badge ? (
                    <Badge variant="secondary" className="ml-auto">
                      {c.badge}
                    </Badge>
                  ) : null}
                </NavLink>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <NavLink LinkComponent={LinkComponent} item={item} onNavigate={onNavigate} className="block">
      {content}
    </NavLink>
  );
}

/* ---------- Shared bits ---------- */
function SecondaryLink({
  item,
  pathname,
  LinkComponent,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  const active = isActive(item.href, pathname);
  return (
    <NavLink
      LinkComponent={LinkComponent}
      item={item}
      onNavigate={onNavigate}
      className={cn(
        "px-2 py-1.5 text-sm hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {item.label}
      {item.badge ? (
        <Badge variant="secondary" className="ml-1">
          {item.badge}
        </Badge>
      ) : null}
    </NavLink>
  );
}

/**
 * NavLink: wraps your LinkComponent to:
 *  - pass through external attrs
 *  - call onNavigate() after click to close menus/sheet
 */
function NavLink({
  LinkComponent,
  item,
  className,
  onNavigate,
  children,
}: {
  LinkComponent: LinkLike;
  item: NavItem;
  className?: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <LinkComponent
      href={item.href ?? "#"}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={className}
      onClick={() => {
        // Let the navigation happen, but also close any open menus/sheet
        onNavigate?.();
      }}
    >
      {children}
    </LinkComponent>
  );
}

