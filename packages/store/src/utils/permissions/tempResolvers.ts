import { PermissionsContext, TemporaryScope } from './types';

export const tempResolvers: Record<TemporaryScope, (ctx: PermissionsContext) => boolean> = {
    dispatch_event_scoped: (ctx) =>
        ctx.temporaryScopes?.includes('dispatch_event_scoped') === true,

    cdc_event_scoped: (ctx) =>
        ctx.temporaryScopes?.includes('cdc_event_scoped') === true,

    warehouse_shift_scoped: (ctx) =>
        ctx.temporaryScopes?.includes('warehouse_shift_scoped') === true,

    admin_override: (ctx) =>
        ctx.temporaryScopes?.includes('admin_override') === true &&
        ['admin', 'regional_admin', 'national_admin'].includes(ctx.navRole as any),
};
