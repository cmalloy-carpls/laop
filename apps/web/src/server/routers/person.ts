import { z } from 'zod'
import { eq, and, or, sql } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { withTenant } from '@laop/db'
import { persons } from '@laop/db/schema'
import { asOrganizationId } from '@laop/contracts'

const PersonNameSchema = z.object({
  first: z.string().min(1),
  middle: z.string().nullable(),
  last: z.string().min(1),
  suffix: z.string().nullable(),
})

const PhoneSchema = z.object({
  number: z.string(),
  type: z.enum(['mobile', 'home', 'work', 'other']),
  primary: z.boolean(),
  smsConsent: z.boolean(),
  smsConsentDate: z.string().nullable(),
})

const AddressSchema = z.object({
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  stateCode: z.string(),
  postalCode: z.string(),
  countyFips: z.string().nullable(),
  primary: z.boolean(),
})

export const personRouter = router({
  create: protectedProcedure
    .input(z.object({
      primaryName: PersonNameSchema,
      aliases: z.array(PersonNameSchema).optional(),
      phones: z.array(PhoneSchema).optional(),
      addresses: z.array(AddressSchema).optional(),
      dateOfBirth: z.string().nullable().optional(),
      language: z.string().nullable().optional(),
      householdSize: z.number().int().positive().nullable().optional(),
      annualIncome: z.number().int().nonnegative().nullable().optional(),
      incomePeriod: z.enum(['annual', 'monthly', 'weekly']).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)
      const userId = ctx.session.userId as Parameters<typeof withTenant>[1]

      return withTenant(orgId, userId as any, async (tx) => {
        const [person] = await tx.insert(persons).values({
          organization_id: ctx.session.organizationId,
          primary_name: input.primaryName,
          aliases: input.aliases ?? [],
          phones: input.phones ?? [],
          email_contacts: [],
          addresses: input.addresses ?? [],
          date_of_birth: input.dateOfBirth ?? null,
          language: input.language ?? null,
          household_size: input.householdSize ?? null,
          annual_income: input.annualIncome ? BigInt(input.annualIncome) : null,
          income_period: input.incomePeriod ?? null,
          status: 'active',
          merged_into_id: null,
        }).returning()
        return person
      })
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, null as any, async (tx) => {
        const [person] = await tx
          .select()
          .from(persons)
          .where(and(
            eq(persons.id, input.id),
            eq(persons.organization_id, ctx.session.organizationId),
          ))
        return person ?? null
      })
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const orgId = asOrganizationId(ctx.session.organizationId)

      return withTenant(orgId, null as any, async (tx) => {
        return tx
          .select()
          .from(persons)
          .where(and(
            eq(persons.organization_id, ctx.session.organizationId),
            eq(persons.status, 'active'),
            or(
              sql`${persons.primary_name}->>'first' ILIKE ${'%' + input.query + '%'}`,
              sql`${persons.primary_name}->>'last' ILIKE ${'%' + input.query + '%'}`,
            ),
          ))
          .limit(input.limit)
      })
    }),
})
