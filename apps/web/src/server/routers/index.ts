import { router } from '../trpc'
import { personRouter } from './person'
import { matterRouter } from './matter'
import { engagementRouter } from './engagement'
import { problemRouter } from './problem'

export const appRouter = router({
  person: personRouter,
  matter: matterRouter,
  engagement: engagementRouter,
  problem: problemRouter,
})

export type AppRouter = typeof appRouter
