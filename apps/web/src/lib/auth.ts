import { auth } from '@clerk/nextjs/server'

export interface Session {
  userId: string
  organizationId: string
  role: 'admin' | 'staff' | 'supervisor' | 'readonly'
}

/**
 * Returns the current session from Clerk JWT.
 * organizationId comes from Clerk's active organization — must match an Organization row in DB.
 * Returns null when unauthenticated or when no active org is set (e.g. user hasn't joined an org yet).
 */
export async function getSession(): Promise<Session | null> {
  const { userId, orgId, orgRole } = await auth()
  if (!userId || !orgId) return null

  return {
    userId,
    organizationId: orgId,
    role: mapClerkRole(orgRole),
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}

function mapClerkRole(orgRole: string | null | undefined): Session['role'] {
  switch (orgRole) {
    case 'org:admin':      return 'admin'
    case 'org:supervisor': return 'supervisor'
    case 'org:staff':      return 'staff'
    default:               return 'readonly'
  }
}
