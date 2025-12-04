"use client";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/primitives/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu";
import { Badge } from "@workspace/ui/primitives/badge";
import { Separator } from "@workspace/ui/primitives/separator";
import { ScrollArea } from "@workspace/ui/primitives/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/primitives/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import {
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Circle,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { Bell } from "./bell";
import { LinkLike } from "@workspace/store/types/global.ts";
import {
  canSee,
  GlobalNavConfig,
  isActive,
  NavItem,
  NavRole,
} from "@workspace/store/utils/nav";
import DistanceUnitToggle from "./distance-unit-toggle";
// Keep the top bar compact on small screens
const MOBILE_TOP_BAR_HEIGHT = 56;
function filterNavTree(
  items: NavItem[],
  role?: NavRole,
  isAuthenticated = false,
): NavItem[] {
  return items
    .map((item) => {
      const nextChildren = item.children
        ? filterNavTree(item.children, role, isAuthenticated)
        : undefined;
      const hasVisibleChildren = Boolean(nextChildren?.length);
      const selfVisible = canSee(item, role, isAuthenticated);
      if (!selfVisible && !hasVisibleChildren) return null;
      if (item.children && !hasVisibleChildren && (!selfVisible || !item.href))
        return null;
      return { ...item, children: nextChildren };
    })
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
}
export interface GlobalNavCoreProps {
  config: GlobalNavConfig;
  role?: NavRole;
  pathname: string;
  LinkComponent: LinkLike;
  rightSlot?: React.ReactNode;
  isAuthenticated: boolean;
}
export function GlobalNavCore({
  config,
  role,
  pathname,
  LinkComponent,
  rightSlot,
  isAuthenticated,
}: GlobalNavCoreProps) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(true);
  const [primaryItems, setPrimaryItems] = useState<NavItem[]>([]);
  const [secondaryItems, setSecondaryItems] = useState<NavItem[]>([]);
  const handleAnyNavigate = useCallback(() => {
    // Reserved for future cross-device sync (matches previous API surface)
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      setPrimaryItems(filterNavTree(config.primary, role, isAuthenticated));
      setSecondaryItems(
        filterNavTree(config.secondary ?? [], role, isAuthenticated),
      );
    }, 50);
    return () => clearTimeout(t);
  }, [config.primary, config.secondary, role, isAuthenticated]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyOffsets = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop) {
        document.body.style.paddingLeft = desktopCollapsed ? "7rem" : "18rem";
        document.body.style.paddingTop = "0px";
      } else {
        document.body.style.paddingLeft = "0px";
        document.body.style.paddingTop = `${MOBILE_TOP_BAR_HEIGHT}px`;
      }
    };
    applyOffsets();
    window.addEventListener("resize", applyOffsets);
    return () => {
      window.removeEventListener("resize", applyOffsets);
      document.body.style.paddingLeft = "";
      document.body.style.paddingTop = "";
    };
  }, [desktopCollapsed]);
  return (
    <>
      <MobileTopBar
        config={config}
        LinkComponent={LinkComponent}
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
        onNavigate={handleAnyNavigate}
        pathname={pathname}
        isAuthenticated={isAuthenticated}
      />
      <DesktopSideNav
        config={config}
        pathname={pathname}
        LinkComponent={LinkComponent}
        onNavigate={handleAnyNavigate}
        collapsed={desktopCollapsed}
        onToggleCollapsed={() => setDesktopCollapsed((value) => !value)}
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
        isAuthenticated={isAuthenticated}
      />
      {rightSlot}
    </>
  );
}
function MobileTopBar({
  config,
  LinkComponent,
  onNavigate,
  pathname,
  primaryItems,
  secondaryItems,
  isAuthenticated,
}: {
  config: GlobalNavConfig;
  LinkComponent: LinkLike;
  onNavigate: () => void;
  pathname: string;
  primaryItems: NavItem[];
  secondaryItems: NavItem[];
  isAuthenticated: boolean;
}) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[1100] flex items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 text-sidebar-foreground lg:hidden"
      style={{ height: MOBILE_TOP_BAR_HEIGHT }}
    >
      <MobileNav
        config={config}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
        pathname={pathname}
      />
      <LinkComponent
        href={config.brand.href ?? "/"}
        className="flex flex-1 items-center gap-2 overflow-hidden"
      >
        <BrandSymbol brand={config.brand} />
        <span className="truncate text-sm font-semibold">
          {config.brand.name}
        </span>
      </LinkComponent>
      {!isAuthenticated ? (
        <a href="/sign-in">
          <Button variant="secondary" size="sm">
            Sign in
          </Button>
        </a>
      ) : null}
      <div className="flex items-center gap-1">
        <Bell popoverSide="bottom" popoverAlign="end" />
        {/* <ThemeToggle /> */}
        {/* <DistanceUnitToggle /> */}
      </div>
    </div>
  );
}
function DesktopSideNav({
  config,
  pathname,
  LinkComponent,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  primaryItems,
  secondaryItems,
  isAuthenticated,
}: {
  config: GlobalNavConfig;
  pathname: string;
  LinkComponent: LinkLike;
  onNavigate: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  primaryItems: NavItem[];
  secondaryItems: NavItem[];
  isAuthenticated: boolean;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[1100] hidden border-r border-sidebar-border bg-sidebar/90 text-sidebar-foreground backdrop-blur supports-[backdrop-filter]:bg-sidebar/70 transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-28" : "w-72",
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b border-sidebar-border px-2">
        <LinkComponent
          href={config.brand.href ?? "/"}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md py-1 transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <BrandSymbol brand={config.brand} />
          {!collapsed ? (
            <span className="truncate text-sm font-semibold">
              {config.brand.name}
            </span>
          ) : null}
        </LinkComponent>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-sidebar-foreground"
          onClick={onToggleCollapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle navigation width</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div
          className={cn(
            "mt-3 flex items-center gap-2",
            collapsed ? "justify-center flex-col" : "justify-evenly",
          )}
        >
          <ThemeToggle />
          <DistanceUnitToggle />
          {!isAuthenticated ? (
            <a href="/sign-in">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </a>
          ) : null}
          <Bell popoverSide="right" popoverAlign="start" />
        </div>
        <Separator className="my-3 bg-sidebar-border" />
        <div
          className={cn(
            "flex flex-col space-y-1 py-3",
            collapsed ? "items-center px-0" : "px-2",
          )}
        >
          {primaryItems.map((item) => (
            <DesktopNavItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              LinkComponent={LinkComponent}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-sidebar-border px-2 py-3">
        {secondaryItems.length ? (
          <>
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <DesktopNavItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  LinkComponent={LinkComponent}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
function DesktopNavItem({
  item,
  collapsed,
  pathname,
  LinkComponent,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  LinkComponent: LinkLike;
  onNavigate: () => void;
}) {
  const visibleChildren = item.children ?? [];
  const hasChildren = visibleChildren.length > 0;
  const active = navItemIsActive(item, pathname);
  const [open, setOpen] = useState(() => active && !collapsed);
  const [popoverOpen, setPopoverOpen] = useState(false);
  useEffect(() => {
    if (collapsed) {
      setOpen(false);
      return;
    }
    if (active) {
      setOpen(true);
    }
  }, [active, collapsed]);
  useEffect(() => {
    if (!collapsed) {
      setPopoverOpen(false);
    }
  }, [collapsed]);
  useEffect(() => {
    setPopoverOpen(false);
  }, [pathname]);
  if (collapsed) {
    if (hasChildren) {
      return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative mx-auto flex h-14 w-14 items-center justify-center rounded-md transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  aria-label={item.label}
                >
                  <NavItemIcon item={item} className="h-8 w-8" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="z-[1400]">
              <span className="flex items-center gap-2">
                {item.label}
                {item.badge ? (
                  <Badge variant="secondary">{item.badge}</Badge>
                ) : null}
              </span>
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="right"
            align="start"
            className="z-[1200] w-64 p-0"
          >
            <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2 text-sm font-semibold text-sidebar-foreground">
              <span>{item.label}</span>
              {item.badge ? (
                <Badge variant="secondary">{item.badge}</Badge>
              ) : null}
            </div>
            <div className="space-y-1 p-2">
              {visibleChildren.map((child) => {
                const childActive = navItemIsActive(child, pathname);
                return (
                  <NavLink
                    key={child.label}
                    LinkComponent={LinkComponent}
                    item={child}
                    onNavigate={() => {
                      setPopoverOpen(false);
                      onNavigate();
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      childActive
                        ? "bg-sidebar-primary/80 text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70",
                    )}
                  >
                    <NavItemIcon item={child} className="h-5 w-5" />
                    <span className="flex-1 truncate">{child.label}</span>
                    {child.badge ? (
                      <Badge variant="secondary" className="ml-auto">
                        {child.badge}
                      </Badge>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            LinkComponent={LinkComponent}
            item={item}
            onNavigate={onNavigate}
            className={cn(
              "relative mx-auto flex h-14 w-14 items-center justify-center rounded-md transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <NavItemIcon item={item} className="h-8 w-8" />
            {item.badge ? (
              <span className="absolute -right-1 -top-1">
                <Badge
                  variant="secondary"
                  className="px-1 py-0 text-[10px] leading-none"
                >
                  {item.badge}
                </Badge>
              </span>
            ) : null}
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span className="flex items-center gap-2">
            {item.label}
            {item.badge ? (
              <Badge variant="secondary">{item.badge}</Badge>
            ) : null}
          </span>
        </TooltipContent>
      </Tooltip>
    );
  }
  if (hasChildren) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-transparent",
                active
                  ? "bg-sidebar-primary/80 text-sidebar-primary-foreground"
                  : "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <NavItemIcon item={item} className="h-7 w-7" />
            </span>
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge ? (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            ) : null}
            <ChevronDown
              className={cn(
                "ml-1 h-4 w-4 shrink-0 transition-transform",
                open ? "rotate-180" : "rotate-0",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 pl-5 pr-2">
          {visibleChildren.map((child) => {
            const childActive = navItemIsActive(child, pathname);
            return (
              <NavLink
                key={child.label}
                LinkComponent={LinkComponent}
                item={child}
                onNavigate={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  childActive
                    ? "bg-sidebar-primary/80 text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70",
                )}
              >
                <NavItemIcon item={child} className="h-5 w-5" />
                <span className="flex-1 truncate">{child.label}</span>
                {child.badge ? (
                  <Badge variant="secondary" className="ml-auto">
                    {child.badge}
                  </Badge>
                ) : null}
              </NavLink>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return (
    <NavLink
      LinkComponent={LinkComponent}
      item={item}
      onNavigate={onNavigate}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-transparent",
          active
            ? "bg-sidebar-primary/80 text-sidebar-primary-foreground"
            : "bg-sidebar-accent text-sidebar-accent-foreground",
        )}
      >
        <NavItemIcon item={item} className="h-7 w-7" />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      ) : null}
    </NavLink>
  );
}
function MobileNav({
  config,
  LinkComponent,
  onNavigate,
  pathname,
  primaryItems,
  secondaryItems,
}: {
  config: GlobalNavConfig;
  LinkComponent: LinkLike;
  onNavigate: () => void;
  pathname: string;
  primaryItems: NavItem[];
  secondaryItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const handleNavigate = useCallback(() => {
    setOpen(false);
    onNavigate();
  }, [onNavigate]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className="text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="z-[1200] w-[300px] max-w-96 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border p-4">
          <SheetTitle className="flex items-center gap-2">
            <BrandSymbol brand={config.brand} />
            <span className="truncate text-sm font-semibold">
              {config.brand.name}
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className={cn("mt-1 flex justify-center")}>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DistanceUnitToggle />
          </div>
        </div>
        <nav className="px-2 py-4">
          <div className="space-y-1">
            {primaryItems.map((item) => (
              <MobileNavItem
                key={item.label}
                item={item}
                LinkComponent={LinkComponent}
                onNavigate={handleNavigate}
                pathname={pathname}
              />
            ))}
          </div>
          {secondaryItems.length ? (
            <>
              <Separator className="my-3 bg-sidebar-border" />
              <div className="space-y-1">
                {secondaryItems.map((item) => (
                  <MobileNavItem
                    key={item.label}
                    item={item}
                    LinkComponent={LinkComponent}
                    onNavigate={handleNavigate}
                    pathname={pathname}
                  />
                ))}
              </div>
            </>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
function MobileNavItem({
  item,
  LinkComponent,
  onNavigate,
  pathname,
}: {
  item: NavItem;
  LinkComponent: LinkLike;
  onNavigate: () => void;
  pathname: string;
}) {
  const visibleChildren = item.children ?? [];
  const hasChildren = visibleChildren.length > 0;
  const active = navItemIsActive(item, pathname);
  const triggerContent = (
    <div
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <div className="flex items-center gap-2">
        <NavItemIcon item={item} className="h-6 w-6" />
        <span className="truncate">{item.label}</span>
        {item.badge ? (
          <Badge className="ml-1" variant="secondary">
            {item.badge}
          </Badge>
        ) : null}
      </div>
      {hasChildren ? <ChevronRight className="h-5 w-5 opacity-70" /> : null}
    </div>
  );
  if (hasChildren) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full text-left">{triggerContent}</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-[1200] w-[260px] border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          <DropdownMenuLabel className="text-sidebar-foreground/70">
            {item.label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-sidebar-border" />
          {visibleChildren.map((child) => {
            const childActive = navItemIsActive(child, pathname);
            return (
              <DropdownMenuItem key={child.label} asChild>
                <NavLink
                  LinkComponent={LinkComponent}
                  item={child}
                  onNavigate={onNavigate}
                  className={cn(
                    "flex items-center gap-2",
                    childActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70",
                  )}
                >
                  <NavItemIcon item={child} className="h-5 w-5" />
                  <span>{child.label}</span>
                  {child.badge ? (
                    <Badge variant="secondary" className="ml-auto">
                      {child.badge}
                    </Badge>
                  ) : null}
                </NavLink>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <NavLink
      LinkComponent={LinkComponent}
      item={item}
      onNavigate={onNavigate}
      className="block"
    >
      {triggerContent}
    </NavLink>
  );
}
function BrandSymbol({
  brand,
  className,
}: {
  brand: GlobalNavConfig["brand"];
  className?: string;
}) {
  if (brand.logoSrc) {
    return (
      <img
        src={brand.logoSrc}
        alt={`${brand.name} logo`}
        className={cn("h-7 w-7 shrink-0 rounded-md object-contain", className)}
      />
    );
  }
  const initials = brand.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground",
        className,
      )}
    >
      {initials || "•"}
    </span>
  );
}
function NavItemIcon({
  item,
  className,
}: {
  item: NavItem;
  className?: string;
}) {
  const Icon = item.icon ?? Circle;
  return <Icon className={className} />;
}
function navItemIsActive(item: NavItem, pathname: string): boolean {
  if (isActive(item.href, pathname, item.match)) {
    return true;
  }
  return (item.children ?? []).some((child) =>
    navItemIsActive(child, pathname),
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
        onNavigate?.();
      }}
    >
      {children}
    </LinkComponent>
  );
}
