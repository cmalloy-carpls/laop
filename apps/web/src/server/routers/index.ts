import { router } from '../trpc'
import { personRouter } from './person'
import { matterRouter } from './matter'
import { engagementRouter } from './engagement'

export const appRouter = router({
  person: personRouter,
  matter: matterRouter,
  engagement: engagementRouter,
})

export type AppRouter = typeof appRouter
