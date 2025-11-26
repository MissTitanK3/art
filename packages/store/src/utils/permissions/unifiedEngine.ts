import { PermissionsContext, VisibilityScope, VisibilityResult } from './types';
import { roleAllowedForScope } from './roleRules';
import { scopeResolvers } from './scopeResolvers';
import { tempResolvers } from './tempResolvers';

const DEBUG = process.env.NODE_ENV !== 'production';

export function evaluateAccess(
    scope: VisibilityScope,
    ctx: PermissionsContext
): VisibilityResult {
    const debug: any[] = [];

    // Diagnostic snapshot for debugging and auditing
    if (DEBUG) {
        debug.push({
            step: 'context_snapshot',
            userId: ctx.userId,
            navRole: ctx.navRole,
            userPods: ctx.userPods ?? [],
            userOrgs: ctx.userOrgs ?? [],
            ownerProfileId: ctx.ownerProfileId,
            ownerPodIds: ctx.ownerPodIds ?? [],
            ownerOrgIds: ctx.ownerOrgIds ?? [],
            invitedUserIds: ctx.invitedUserIds ?? [],
            targetPodId: ctx.targetPodId,
            targetOrgId: ctx.targetOrgId,
            scope,
        });
    }

    // 1. Temporary overrides
    for (const key of Object.keys(tempResolvers)) {
        const allowed = tempResolvers[key as keyof typeof tempResolvers](ctx);
        if (DEBUG) debug.push({ temp: key, allowed });
        if (allowed) return { access: true, reason: null, debug };
    }

    // 2. Role gating
    const roleOk = roleAllowedForScope(ctx.navRole!, scope);
    if (DEBUG) debug.push({ step: 'role', scope, roleOk });
    if (!roleOk) return { access: null, reason: "Controlled Information", debug };

    // 3. Scope-based membership
    const scopeOk = scopeResolvers[scope](ctx);
    if (DEBUG) debug.push({ step: 'scope', scope, scopeOk });
    if (!scopeOk) return { access: null, reason: "Controlled Information", debug };

    return { access: true, reason: null, debug };
}
