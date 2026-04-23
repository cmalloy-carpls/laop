import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { withTenant } from '@laop/db'
import { problems } from '@laop/db/schema'
import { asOrganizationId } from '@laop/contracts'

export const problemRouter = router({
  list: protectedProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)
      return withTenant(orgId, null, async (tx) => {
        return tx
          .select()
          .from(problems)
          .where(input?.activeOnly !== false ? eq(problems.is_active, true) : undefined)
          .orderBy(asc(problems.sort_order), asc(problems.label))
      })
    }),
})
