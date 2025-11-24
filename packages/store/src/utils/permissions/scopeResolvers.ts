import { PermissionsContext, VisibilityScope } from './types';

export const scopeResolvers: Record<VisibilityScope, (ctx: PermissionsContext) => boolean> = {
    private: (ctx) =>
        ctx.targetOwnerId === ctx.userId,

    pod_specific: (ctx) =>
        ctx.targetPodId !== undefined && ctx.userPods?.includes(ctx.targetPodId) === true,

    pods_general: (ctx) =>
        (ctx.userPods?.length ?? 0) > 0,

    org_specific: (ctx) =>
        ctx.targetOrgId !== undefined && ctx.userOrgs?.includes(ctx.targetOrgId) === true,

    orgs_general: (ctx) =>
        (ctx.userOrgs?.length ?? 0) > 0,

    regional: (ctx) =>
        !ctx.targetRegionId || ctx.targetRegionId === ctx.regionId,

    dispatch_dashboard: (ctx) => true,
    schedules_manage: (ctx) => true,
    verified_ops: (ctx) => true,
    elevated_ops: (ctx) => true,
    core_features: (ctx) => true,
    manage_instructors: (ctx) => true,
    manage_sessions: (ctx) => true,
    schedule_classes: (ctx) => true,
    create_pathway_class: (ctx) => true,
    manage_advocacy: (ctx) => true,
    manage_notifications: (ctx) => true,
    manage_users: (ctx) => true,
};
