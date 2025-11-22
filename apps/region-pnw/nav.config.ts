import {
  completeOnboarding,
  elevatedRoles,
  GlobalNavConfigInput,
  localAdmins,
  regionAdmins,
  verifiedAdmins,
} from '@workspace/store/utils/nav';

// Externalize region-specific links to environment where possible
const SIGNAL_GROUP_URL = process.env.NEXT_PUBLIC_SIGNAL_GROUP_URL || undefined;

export const navConfig: GlobalNavConfigInput = {
  brand: {
    name: `ART Region ${process.env.NEXT_PUBLIC_BRAND_NAME || ''}`,
    href: '/',
    logoSrc: '/art.png', // optional, string only
  },
  primary: [
    {
      label: 'Create',
      icon: 'new',
      href: '/team-req',
      roles: elevatedRoles,
      // children: [
      //   { label: 'Rapid Response Request', href: '/team-req', roles: elevatedRoles },
      //   { label: 'Community Aid Request', href: '/team-req', roles: elevatedRoles },
      //   { label: 'Technical Aid Request', href: '/team-req', roles: elevatedRoles },
      // ],
    },
    {
      label: 'Meet-A-Need',
      icon: 'hand-heart',
      href: '/meet-a-need',
      roles: completeOnboarding,
    },
    {
      label: 'Missing Persons',
      icon: 'file-search',
      href: '/missing-persons',
      roles: completeOnboarding,
    },
    {
      label: 'Advocacy Network',
      href: '/admin/advocacy-groups',
      icon: 'link',
      roles: regionAdmins,
    },
    {
      label: 'Dispatch',
      icon: 'radio',
      roles: completeOnboarding,
      children: [
        { label: 'Dispatch Map', href: '/dispatches', roles: elevatedRoles },
        { label: 'Community Watch', href: '/watch', roles: completeOnboarding },
        {
          label: 'Confirmed Watch',
          href: '/confirmed-watch',
          roles: verifiedAdmins,
        },
        { label: 'Coverage Schedules', href: '/schedules', roles: localAdmins },
        { label: 'Warehouse', href: '/warehouse', roles: elevatedRoles },
      ],
    },
    {
      label: 'Pods',
      icon: 'map-pin',
      roles: completeOnboarding,
      children: [
        { label: 'Directory', href: '/pods', roles: completeOnboarding, match: 'exact' },
        { label: 'Create Pod', href: '/pods/new', roles: elevatedRoles },
        { label: 'Collective Calendar', href: '/pods/calendar', roles: completeOnboarding },
      ],
    },
    {
      label: 'Knowledge',
      icon: 'book',
      roles: completeOnboarding,
      children: [
        { label: 'Academy', href: '/academy' },
        { label: 'Intents', href: '/intents' },
        { label: 'Roles', href: '/roles' },
        { label: 'Impact', href: '/impact' },
        { label: 'Present', href: '/present', roles: elevatedRoles },
      ],
    },
    // {
    //   label: 'Warehousing',
    //   icon: 'wharehouse',
    //   href: '/warehousing',
    //   roles: verifiedRoles,
    // },
  ],
  secondary: [
    {
      label: 'Settings',
      icon: 'settings',
      roles: completeOnboarding,
      children: [
        { label: 'My Profile', href: '/my-profile' },
        { label: 'Settings', href: '/settings' },
        {
          label: 'Admin',
          href: '/admin',
          roles: ['dispatcher_admin', 'admin', 'regional_admin', 'national_admin'],
        },
        {
          label: 'How To Use Platform',
          href: '/how-to-use',
          roles: completeOnboarding,
        },
        ...(SIGNAL_GROUP_URL
          ? [
              {
                label: 'Region Onboarding Signal',
                href: SIGNAL_GROUP_URL,
              } as const,
            ]
          : []),
        {
          label: 'New Region Setup Signal',
          href: 'https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-',
        },
        {
          label: 'Log out',
          href: '/sign-out',
          icon: 'log-out',
          roles: completeOnboarding,
        },
        // { label: 'Credential Card', href: '/credentials' },
      ],
    },
  ],
};
