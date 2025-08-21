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
      label: 'Create',
      icon: 'new',
      children: [
        { label: 'Rapid Response Request', href: '/team-req', roles: elevatedRoles },
        { label: 'Community Aid Request', href: '/team-req', roles: elevatedRoles },
      ],
    },
    {
      label: 'Dispatch',
      icon: 'radio',
      children: [
        { label: 'Dispatch Map', href: '/dispatches', roles: elevatedRoles },
        { label: 'Community Watch', href: '/watch', roles: completeOnboarding },
        { label: 'Coverage Schedules', href: '/schedules', roles: localAdmins },
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
      label: 'Knowledge',
      icon: 'book',
      children: [
        { label: 'Academy', href: '/academy' },
        { label: 'Intents', href: '/intents' },
        { label: 'Roles', href: '/roles' },
        { label: 'Impact', href: '/impact' },
      ],
    },
  ],
  secondary: [
    {
      label: 'Settings',
      icon: 'settings',
      children: [
        { label: 'My Profile', href: '/my-profile' },
        {
          label: 'Signal Onboarding Group',
          href: 'https://signal.group/#CjQKICDTHoywf-qxIszjCcAepvtYJWWzLuEgC0w7Akoun5btEhDAWr_VlbyhSIQqIeTmdQSM',
        },
        { label: 'Docs', href: '/https://docs.alwaysreadytools.org', external: true },
        { label: 'Settings', href: '/settings' },
        { label: 'Credential Card', href: '/credentials' },
        { label: 'Admin', href: '/admin', roles: regionAdmins },
      ],
    },
  ],
};
