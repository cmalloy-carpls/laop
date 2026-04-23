export interface PageParams {
  limit: number   // max 250
  offset: number
}

export interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export function emptyPage<T>(params: PageParams): Page<T> {
  return { items: [], total: 0, limit: params.limit, offset: params.offset, hasMore: false }
}

export interface CursorPageParams {
  limit: number
  cursor?: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}
