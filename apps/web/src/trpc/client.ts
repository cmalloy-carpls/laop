'use client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers'

export const api: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>()
