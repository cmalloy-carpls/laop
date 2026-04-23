import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { withTenant } from '@laop/db'
import { matters, persons, problems } from '@laop/db/schema'
import { asOrganizationId } from '@laop/contracts'

export const matterRouter = router({
  create: protectedProcedure
    .input(z.object({
      personId: z.string(),
      problemId: z.string(),
      countyFips: z.string().optional(),
      stateCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, ctx.session.userId as any, async (tx) => {
        const [matter] = await tx.insert(matters).values({
          organization_id: ctx.session.organizationId,
          person_id: input.personId,
          problem_id: input.problemId,
          county_fips: input.countyFips ?? null,
          state_code: input.stateCode ?? null,
          status: 'open',
          opened_at: new Date(),
          closed_at: null,
          duplicate_of_id: null,
        }).returning()
        return matter
      })
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, null as any, async (tx) => {
        const rows = await tx
          .select({
            matter: matters,
            person: persons,
            problem: problems,
          })
          .from(matters)
          .innerJoin(persons, eq(matters.person_id, persons.id))
          .innerJoin(problems, eq(matters.problem_id, problems.id))
          .where(and(
            eq(matters.id, input.id),
            eq(matters.organization_id, ctx.session.organizationId),
          ))
        return rows[0] ?? null
      })
    }),

  list: protectedProcedure
    .input(z.object({
      personId: z.string().optional(),
      status: z.enum(['open', 'closed', 'referred-out', 'duplicate']).optional(),
      limit: z.number().int().min(1).max(100).default(25),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, null as any, async (tx) => {
        const conditions = [eq(matters.organization_id, ctx.session.organizationId)]
        if (input.personId) conditions.push(eq(matters.person_id, input.personId))
        if (input.status) conditions.push(eq(matters.status, input.status))

        return tx
          .select()
          .from(matters)
          .where(and(...conditions))
          .limit(input.limit)
          .offset(input.offset)
      })
    }),
})
