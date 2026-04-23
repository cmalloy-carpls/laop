import 'server-only'
import { createTRPCProxyClient, loggerLink, TRPCClientError } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import { callTRPCProcedure } from '@trpc/server'
import { type TRPCErrorResponse } from '@trpc/server/rpc'
import { createTRPCContext } from '@/server/trpc'
import { appRouter, type AppRouter } from '@/server/routers'

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === 'development' ||
        (op.direction === 'down' && op.result instanceof Error),
    }),
    () =>
      ({ op }) =>
        observable((observer) => {
          createTRPCContext()
            .then((ctx) =>
              callTRPCProcedure({
                router: appRouter,
                path: op.path,
                getRawInput: async () => op.input,
                ctx,
                type: op.type,
                signal: undefined,
                batchIndex: 0,
              }),
            )
            .then((data) => {
              observer.next({ result: { data } })
              observer.complete()
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause))
            })
        }),
  ],
})
