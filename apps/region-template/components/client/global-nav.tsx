// apps/region-template/components/client/global-nav.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { GlobalNavConfigInput, GlobalNavConfig, NavItemInput, NavItem, NavRole } from "@workspace/ui/types/nav";
import { navIconMap } from "@workspace/ui/icons/nav-icons";
import { GlobalNavCore, LinkLikeProps } from "@workspace/ui/components/client/global-nav";

function LinkAdapter(props: LinkLikeProps) {
  const { href = "#", children, className, target, rel, onClick } = props;
  return (
    <NextLink href={href} className={className} target={target} rel={rel} onClick={onClick}>
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
}: {
  config: GlobalNavConfigInput;
  role?: NavRole;
  rightSlot?: React.ReactNode;
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
    />
  );
}
