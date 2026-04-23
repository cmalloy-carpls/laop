import { initTRPC, TRPCError } from '@trpc/server'
import { cache } from 'react'
import { getSession } from '@/lib/auth'
import type { Session } from '@/lib/auth'

export interface TRPCContext {
  session: Session | null
}

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  const session = await getSession()
  return { session }
})

const t = initTRPC.context<TRPCContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { session: ctx.session } })
})
