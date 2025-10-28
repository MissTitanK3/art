// apps/region-pnw/components/client/global-nav.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { GlobalNavCore } from "@workspace/ui/components/client/global-nav";
import { LinkLikeProps } from "@workspace/store/types/global.ts";
import { GlobalNavConfig, GlobalNavConfigInput, NavItem, NavItemInput, NavRole } from "@workspace/store/utils/nav";
import { navIconMap } from "@workspace/ui/components/icons/nav-icons";
import { Button } from "@workspace/ui/components/button";

function LinkAdapter(props: LinkLikeProps) {
  const { href = "#", children, className, target, rel, onClick } = props;
  const isSignOut = typeof href === 'string' && href.startsWith('/sign-out');
  return (
    <NextLink
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={onClick}
      prefetch={isSignOut ? false : undefined}
    >
      {children}
    </NextLink>
  );
}

function mapItems(inputs: NavItemInput[]): NavItem[] {
  return inputs.map((i) => ({
    ...i,
    icon: i.icon ? navIconMap[i.icon] : undefined,
    children: i.children ? mapItems(i.children) : undefined,
  }));
}

export function GlobalNav({
  config,
  role,
  rightSlot,
  isAuthenticated
}: {
  config: GlobalNavConfigInput;
  role?: NavRole;
  rightSlot?: React.ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const resolved: GlobalNavConfig = {
    brand: { ...config.brand },
    primary: mapItems(config.primary),
    secondary: config.secondary ? mapItems(config.secondary) : undefined,
    hideSearch: config.hideSearch,
  };

  return (
    <GlobalNavCore
      config={resolved}
      role={role}
      pathname={pathname}
      LinkComponent={LinkAdapter}
      rightSlot={rightSlot}
      isAuthenticated={isAuthenticated}
    />
  );
}
