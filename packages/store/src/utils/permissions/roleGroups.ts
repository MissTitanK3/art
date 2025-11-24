import { NavRole } from './types';

export const completeOnboarding: NavRole[] = [
    'team_member', 'pod_leader', 'trainer', 'dispatcher_basic',
    'dispatcher_verified', 'dispatcher_admin', 'admin',
    'regional_admin', 'national_admin',
];

export const elevatedRoles: NavRole[] = [
    'pod_leader', 'trainer', 'dispatcher_admin',
    'dispatcher_verified', 'dispatcher_basic', 'admin',
    'regional_admin', 'national_admin',
];

export const podAdmins: NavRole[] = [
    'dispatcher_admin', 'dispatcher_verified', 'dispatcher_basic',
    'admin', 'regional_admin', 'national_admin',
];

export const verifiedAdmins: NavRole[] = [
    'dispatcher_admin', 'dispatcher_verified',
    'admin', 'regional_admin', 'national_admin',
];

export const regionAdmins: NavRole[] = [
    'admin', 'regional_admin', 'national_admin'
];

export const nationalAdmins: NavRole[] = [
    'national_admin'
];
