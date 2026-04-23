import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { withTenant } from '@laop/db'
import { engagements, matters, persons, problems } from '@laop/db/schema'
import { asOrganizationId } from '@laop/contracts'

export const engagementRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      status: z.enum(['intake','conflict-check','eligible','ineligible','open','closed','referred']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)
      return withTenant(orgId, null as any, async (tx) => {
        return tx
          .select({
            engagement: engagements,
            person: persons,
            problem: problems,
          })
          .from(engagements)
          .innerJoin(matters, eq(engagements.matter_id, matters.id))
          .innerJoin(persons, eq(matters.person_id, persons.id))
          .innerJoin(problems, eq(matters.problem_id, problems.id))
          .where(and(
            eq(engagements.organization_id, ctx.session.organizationId),
            input?.status ? eq(engagements.status, input.status) : undefined,
          ))
          .orderBy(desc(engagements.opened_at))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0)
      })
    }),

  create: protectedProcedure
    .input(z.object({
      matterId: z.string(),
      serviceType: z.enum([
        'brief-advice',
        'limited-action',
        'extended-service',
        'full-representation',
        'information',
        'referral-only',
      ]),
      programId: z.string().optional(),
      assignedUserId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, ctx.session.userId as any, async (tx) => {
        const [engagement] = await tx.insert(engagements).values({
          organization_id: ctx.session.organizationId,
          matter_id: input.matterId,
          program_id: input.programId ?? null,
          service_type: input.serviceType,
          status: 'intake',
          assigned_user_id: input.assignedUserId ?? null,
          opened_at: new Date(),
          closed_at: null,
          closure_reason: null,
          outcome: null,
          closure_note: null,
          lsc_problem_code: null,
          lsc_subproblem_code: null,
          external_id: null,
        }).returning()
        return engagement
      })
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, null as any, async (tx) => {
        const rows = await tx
          .select({
            engagement: engagements,
            matter: matters,
            person: persons,
            problem: problems,
          })
          .from(engagements)
          .innerJoin(matters, eq(engagements.matter_id, matters.id))
          .innerJoin(persons, eq(matters.person_id, persons.id))
          .innerJoin(problems, eq(matters.problem_id, problems.id))
          .where(and(
            eq(engagements.id, input.id),
            eq(engagements.organization_id, ctx.session.organizationId),
          ))
        return rows[0] ?? null
      })
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['intake', 'conflict-check', 'eligible', 'ineligible', 'open', 'closed', 'referred']),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, ctx.session.userId as any, async (tx) => {
        const [updated] = await tx
          .update(engagements)
          .set({ status: input.status, updated_at: new Date() })
          .where(and(
            eq(engagements.id, input.id),
            eq(engagements.organization_id, ctx.session.organizationId),
          ))
          .returning()
        return updated
      })
    }),

  close: protectedProcedure
    .input(z.object({
      id: z.string(),
      closureReason: z.enum([
        'service-rendered',
        'referred-out',
        'client-withdrew',
        'ineligible',
        'conflict',
        'no-show',
        'other',
      ]),
      outcome: z.enum(['favorable', 'unfavorable', 'mixed', 'incomplete', 'pending']),
      closureNote: z.string().optional(),
      lscProblemCode: z.string().optional(),
      lscSubproblemCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, ctx.session.userId as any, async (tx) => {
        const [closed] = await tx
          .update(engagements)
          .set({
            status: 'closed',
            closed_at: new Date(),
            closure_reason: input.closureReason,
            outcome: input.outcome,
            closure_note: input.closureNote ?? null,
            lsc_problem_code: input.lscProblemCode ?? null,
            lsc_subproblem_code: input.lscSubproblemCode ?? null,
            updated_at: new Date(),
          })
          .where(and(
            eq(engagements.id, input.id),
            eq(engagements.organization_id, ctx.session.organizationId),
          ))
          .returning()
        return closed
      })
    }),
})
