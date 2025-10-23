import { completeOnboarding, elevatedRoles, GlobalNavConfigInput, localAdmins } from '@workspace/store/utils/nav';

export const navConfig: GlobalNavConfigInput = {
  brand: {
    name: 'ART Region Template',
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
      label: 'Dispatch',
      icon: 'radio',
      roles: completeOnboarding,
      children: [
        { label: 'Dispatch Map', href: '/dispatches', roles: elevatedRoles },
        { label: 'Community Watch', href: '/watch', roles: completeOnboarding },
        { label: 'Coverage Schedules', href: '/schedules', roles: localAdmins },
      ],
    },
    {
      label: 'Pods',
      icon: 'map-pin',
      roles: elevatedRoles,
      children: [
        { label: 'Directory', href: '/pods', roles: elevatedRoles },
        { label: 'Create Pod', href: '/pods/new', roles: localAdmins },
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
      ],
    },
    {
      label: 'Warehousing',
      icon: 'wharehouse',
      href: '/warehousing',
      roles: completeOnboarding,
    },
    {
      label: 'Missing Persons',
      icon: 'file-search',
      href: '/missing-persons',
      roles: completeOnboarding,
    },
  ],
  secondary: [
    {
      label: 'Settings',
      icon: 'settings',
      roles: completeOnboarding,
      children: [
        { label: 'My Profile', href: '/my-profile' },
        {
          label: 'Signal Onboarding Group',
          href: 'https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-',
        },
        { label: 'Log out', href: '/sign-out', icon: 'log-out', roles: completeOnboarding },
        // { label: 'Docs', href: '/https://docs.alwaysreadytools.org', external: true },
        // { label: 'Settings', href: '/settings' },
        // { label: 'Credential Card', href: '/credentials' },
        // { label: 'Admin', href: '/admin', roles: regionAdmins },
      ],
    },
  ],
};
