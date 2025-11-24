import { PermissionsContext, VisibilityScope } from './types';
import { evaluateAccess } from './unifiedEngine';

export function useUnifiedAccess(scope: VisibilityScope, ctx: PermissionsContext) {
    return evaluateAccess(scope, ctx);
}
