import { PermissionsContext, VisibilityScope } from './types';

export const scopeResolvers: Record<VisibilityScope, (ctx: PermissionsContext) => boolean> = {
    private: (ctx) =>
        ctx.targetOwnerId === ctx.userId,

    only_myself: (ctx) => {
        if (!ctx.userId) return false;
        return ctx.targetOwnerId === ctx.userId;
    },

    manually_selected: (ctx) => {
        if (!ctx.userId) return false;
        if (ctx.invitedUserIds?.includes(ctx.userId)) return true;
        if (ctx.targetOwnerId === ctx.userId) return true;
        return false;
    },

    pod_specific: (ctx) => {
        if (!ctx.userId) return false;
        // Multi-pod ownership
        if (ctx.ownerPodIds && ctx.ownerPodIds.length > 0) {
            return ctx.ownerPodIds.some(pod => ctx.userPods?.includes(pod));
        }
        // Fallback to single target
        return ctx.targetPodId !== undefined && ctx.userPods?.includes(ctx.targetPodId) === true;
    },

    pods_general: (ctx) => {
        if (!ctx.userId) return false;
        // If specific owner pods are defined, check membership
        if (ctx.ownerPodIds && ctx.ownerPodIds.length > 0) {
            if (ctx.ownerPodIds.some(pod => ctx.userPods?.includes(pod))) return true;
        }
        // Admin override or general pod membership if no specific target
        return (
            (ctx.userPods?.length ?? 0) > 0 ||
            ctx.navRole === 'admin' ||
            ctx.navRole === 'regional_admin' ||
            ctx.navRole === 'national_admin'
        );
    },

    org_specific: (ctx) => {
        if (!ctx.userId) return false;
        // Multi-org ownership
        if (ctx.ownerOrgIds && ctx.ownerOrgIds.length > 0) {
            return ctx.ownerOrgIds.some(org => ctx.userOrgs?.includes(org));
        }
        // Fallback
        return ctx.targetOrgId !== undefined && ctx.userOrgs?.includes(ctx.targetOrgId) === true;
    },

    orgs_general: (ctx) => {
        if (!ctx.userId) return false;

        if (ctx.ownerOrgIds && ctx.ownerOrgIds.length > 0) {
            if (ctx.ownerOrgIds.some(org => ctx.userOrgs?.includes(org))) return true;
        }

        return (
            (ctx.userOrgs?.length ?? 0) > 0 ||
            ctx.navRole === 'admin' ||
            ctx.navRole === 'regional_admin' ||
            ctx.navRole === 'national_admin'
        );
    },

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
