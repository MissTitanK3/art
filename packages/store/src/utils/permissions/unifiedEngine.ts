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
