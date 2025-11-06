import {
  completeOnboarding,
  elevatedRoles,
  GlobalNavConfigInput,
  localAdmins,
  regionAdmins,
} from '@workspace/store/utils/nav';

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
      roles: completeOnboarding,
      children: [
        { label: 'Directory', href: '/pods', roles: completeOnboarding },
        { label: 'Create Pod', href: '/pods/new', roles: elevatedRoles },
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
    // {
    //   label: 'Warehousing',
    //   icon: 'wharehouse',
    //   href: '/warehousing',
    //   roles: verifiedRoles,
    // },
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
        { label: 'Admin', href: '/admin', roles: ['dispatcher_admin', 'admin', 'regional_admin', 'national_admin'] },
        { label: 'Log out', href: '/sign-out', icon: 'log-out', roles: completeOnboarding },
        // { label: 'Docs', href: '/https://docs.alwaysreadytools.org', external: true },
        // { label: 'Settings', href: '/settings' },
        // { label: 'Credential Card', href: '/credentials' },
      ],
    },
  ],
};
