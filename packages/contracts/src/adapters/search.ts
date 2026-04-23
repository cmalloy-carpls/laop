import type { OrganizationId } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface SearchAdapter {
  /** Index or update a document */
  upsert(params: UpsertParams): Promise<Result<void>>
  /** Remove a document from the index */
  delete(params: DeleteParams): Promise<Result<void>>
  /** Full-text search */
  search(params: SearchParams): Promise<Result<SearchResult>>
  /** Semantic / vector similarity search */
  semanticSearch(params: SemanticSearchParams): Promise<Result<SearchResult>>
}

export interface UpsertParams {
  index: string
  id: string
  organizationId: OrganizationId
  document: Record<string, unknown>
  embedding?: number[]
}

export interface DeleteParams {
  index: string
  id: string
}

export interface SearchParams {
  index: string
  organizationId: OrganizationId
  query: string
  filters?: Record<string, unknown>
  limit?: number
  offset?: number
}

export interface SemanticSearchParams {
  index: string
  organizationId: OrganizationId
  embedding: number[]
  filters?: Record<string, unknown>
  limit?: number
  minScore?: number
}

export interface SearchResult {
  hits: SearchHit[]
  total: number
}

export interface SearchHit {
  id: string
  score: number
  document: Record<string, unknown>
}
