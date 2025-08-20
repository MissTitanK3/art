// apps/region-template/nav.config.ts
import {
  completeOnboarding,
  elevatedRoles,
  localAdmins,
  regionAdmins,
  type GlobalNavConfigInput,
} from '@workspace/ui/types/nav';

export const navConfig: GlobalNavConfigInput = {
  brand: {
    name: 'A.R.T. Region Template',
    href: '/',
    // logoSrc: "/logo.svg" // optional, string only
  },
  primary: [
    {
      label: 'Home',
      icon: 'home',
      href: '/',
    },
    {
      label: 'Dispatch',
      icon: 'radio',
      children: [
        { label: 'Dispatch Map', href: '/dispatches', roles: elevatedRoles },
        { label: 'Team Request', href: '/team-req', roles: elevatedRoles },
        { label: 'Watch', href: '/watch', roles: completeOnboarding },
        { label: 'Schedules', href: '/schedules', roles: localAdmins },
      ],
    },
    {
      label: 'Pods',
      icon: 'map-pin',
      children: [
        { label: 'Directory', href: '/pods', roles: elevatedRoles },
        { label: 'Create Pod', href: '/pods/new', roles: localAdmins },
      ],
    },
    {
      label: 'Quick Reference',
      icon: 'book',
      children: [
        { label: 'Intents', href: '/intents' },
        { label: 'Roles', href: '/roles' },
        { label: 'Impact', href: '/impact' },
      ],
    },
    { label: 'Academy', href: '/academy', icon: 'graduation-cap' },
    {
      label: 'Signal Onboarding Group',
      href: 'https://signal.group/#CjQKICDTHoywf-qxIszjCcAepvtYJWWzLuEgC0w7Akoun5btEhDAWr_VlbyhSIQqIeTmdQSM',
      icon: 'link',
    },
    { label: 'Admin', href: '/admin', icon: 'shield', roles: regionAdmins },
  ],
  secondary: [
    { label: 'My Profile', href: '/my-profile' },
    {
      label: 'Settings',
      icon: 'settings',
      children: [
        { label: 'Docs', href: '/https://docs.alwaysreadytools.org', external: true },
        { label: 'Settings', href: '/settings' },
        { label: 'Credential Card', href: '/credentials' },
      ],
    },
  ],
};
