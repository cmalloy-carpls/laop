import type {
  AuditEventId, OrganizationId, UserId,
  ISODateTimeString,
} from '../shared/branded.js'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'        // Sensitive record access (e.g., conflict log)
  | 'export'
  | 'login'
  | 'logout'
  | 'override'    // Staff override of automated decision

export interface AuditEvent {
  id: AuditEventId
  /** Null for platform-level events (login, org creation) */
  organizationId: OrganizationId | null
  userId: UserId | null
  action: AuditAction
  resourceType: string    // e.g., "Engagement", "Conflict"
  resourceId: string
  /** JSON patch or relevant field snapshot */
  diff: Record<string, unknown> | null
  /** Client IP address */
  ipAddress: string | null
  occurredAt: ISODateTimeString
}
