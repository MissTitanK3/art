import { NavRole, VisibilityScope } from './types';

export const roleAllowedForScope = (role: NavRole | undefined, scope: VisibilityScope) => {
    if (!role) return false;

    const rules: Record<VisibilityScope, NavRole[]> = {
        private: [
            'team_member', 'pod_leader', 'trainer', 'dispatcher_basic',
            'dispatcher_verified', 'dispatcher_admin', 'admin',
            'regional_admin', 'national_admin'
        ],

        pod_specific: [
            'team_member', 'pod_leader', 'dispatcher_basic', 'dispatcher_verified',
            'dispatcher_admin', 'admin', 'regional_admin', 'national_admin'
        ],

        pods_general: [
            'team_member', 'pod_leader', 'dispatcher_basic', 'dispatcher_verified',
            'dispatcher_admin', 'admin', 'regional_admin', 'national_admin'
        ],

        org_specific: [
            'pod_leader', 'trainer', 'dispatcher_admin', 'admin',
            'regional_admin', 'national_admin'
        ],

        orgs_general: [
            'trainer', 'dispatcher_admin', 'admin', 'regional_admin', 'national_admin'
        ],

        regional: [
            'dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin',
            'admin', 'regional_admin', 'national_admin'
        ],

        dispatch_dashboard: [
            'pod_leader', 'trainer', 'dispatcher_admin',
            'dispatcher_verified', 'dispatcher_basic', 'admin',
            'regional_admin', 'national_admin',
        ],
        schedules_manage: [
            'admin', 'regional_admin', 'national_admin' // localAdmins
        ],
        verified_ops: [
            'dispatcher_admin', 'dispatcher_verified',
            'admin', 'regional_admin', 'national_admin',
        ],
        elevated_ops: [
            'pod_leader', 'trainer', 'dispatcher_admin',
            'dispatcher_verified', 'dispatcher_basic', 'admin',
            'regional_admin', 'national_admin',
        ],
        core_features: [
            'team_member', 'pod_leader', 'trainer', 'dispatcher_basic',
            'dispatcher_verified', 'dispatcher_admin', 'admin',
            'regional_admin', 'national_admin',
        ],

        manage_instructors: [
            'dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin',
            'admin', 'regional_admin', 'national_admin',
        ],

        manage_sessions: [
            'trainer', 'dispatcher_verified', 'dispatcher_admin',
            'admin', 'regional_admin', 'national_admin',
        ],

        schedule_classes: [
            'trainer', 'dispatcher_verified', 'dispatcher_admin',
            'admin', 'regional_admin', 'national_admin',
        ],

        create_pathway_class: [
            'dispatcher_admin',
            'dispatcher_verified',
            'admin',
            'regional_admin',
            'national_admin',
        ],
        manage_advocacy: [
            'dispatcher_basic',
            'dispatcher_verified',
            'dispatcher_admin',
            'admin',
            'regional_admin',
            'national_admin',
        ],
        manage_notifications: [
            'dispatcher_basic',
            'dispatcher_verified',
            'dispatcher_admin',
            'admin',
            'regional_admin',
            'national_admin',
        ],
        manage_users: [
            'dispatcher_basic',
            'dispatcher_verified',
            'dispatcher_admin',
            'admin',
            'regional_admin',
            'national_admin',
        ],
    };

    return rules[scope].includes(role);
};
