import type { OrganizationId, UserId } from './branded.js'

export interface TenantContext {
  organizationId: OrganizationId
  userId: UserId
  /** ISO 8601 — used for audit timestamps and time-sensitive rule evaluation */
  requestedAt: string
}

export interface PlatformContext {
  /** Identifies the caller as platform-level — no org scope */
  platform: true
  userId: UserId
  requestedAt: string
}

export type RequestContext = TenantContext | PlatformContext

export function isTenantContext(ctx: RequestContext): ctx is TenantContext {
  return !('platform' in ctx)
}
