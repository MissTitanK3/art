export type NavRole =
    | 'team_member'
    | 'pod_leader'
    | 'trainer'
    | 'dispatcher_basic'
    | 'dispatcher_verified'
    | 'dispatcher_admin'
    | 'admin'
    | 'regional_admin'
    | 'national_admin';

export type VisibilityScope =
    | 'private'
    | 'pod_specific'
    | 'pods_general'
    | 'org_specific'
    | 'orgs_general'
    | 'regional'
    | 'dispatch_dashboard'
    | 'schedules_manage'
    | 'verified_ops'
    | 'elevated_ops'
    | 'core_features'
    | 'manage_instructors'
    | 'manage_sessions'
    | 'schedule_classes'
    | 'create_pathway_class'
    | 'manage_advocacy'
    | 'manage_notifications'
    | 'manage_users';

export type TemporaryScope =
    | 'dispatch_event_scoped'
    | 'cdc_event_scoped'
    | 'warehouse_shift_scoped'
    | 'admin_override';

export interface PermissionsContext {
    userId?: string;
    navRole?: NavRole;

    userPods?: string[];
    userOrgs?: string[];
    regionId?: string;

    targetOwnerId?: string;
    targetPodId?: string;
    targetOrgId?: string;
    targetRegionId?: string;

    temporaryScopes?: TemporaryScope[];
}

export type VisibilityResult =
    | { access: true; reason: null; debug?: any }
    | { access: null; reason: "Controlled Information"; debug?: any };
