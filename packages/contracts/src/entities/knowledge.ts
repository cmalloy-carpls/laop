import type {
  KnowledgeAtomId, OrganizationId, ProblemId,
  ISODateTimeString,
} from '../shared/branded.js'

export type KnowledgeAtomType =
  | 'topic'          // High-level legal area
  | 'rule'           // Legal rule or statute
  | 'risk'           // Risk factor for clients in this situation
  | 'decision-gate'  // Branch point in triage logic
  | 'action-step'    // Concrete next action for staff or client
  | 'service-route'  // Pathway to a specific service or resource

export interface KnowledgeAtom {
  id: KnowledgeAtomId
  /** Null = platform-level atom visible to all orgs */
  organizationId: OrganizationId | null
  type: KnowledgeAtomType
  label: string
  /** Full content in Markdown */
  body: string
  /** Which legal problems this atom applies to */
  problemIds: ProblemId[]
  /** Parent atoms in the knowledge graph */
  parentIds: KnowledgeAtomId[]
  /** Child atoms in the knowledge graph */
  childIds: KnowledgeAtomId[]
  tags: string[]
  /** Opaque version string of the embedding model used */
  embeddingVersion: string | null
  isPublished: boolean
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/** AI suggestion result — used by intake copilot and solution suggestion engine */
export interface KnowledgeSuggestion {
  atom: KnowledgeAtom
  /** Relevance score 0–1 from the retrieval step */
  score: number
  /** Brief explanation of why this atom was suggested */
  rationale: string
}

export interface CreateKnowledgeAtomInput {
  type: KnowledgeAtomType
  label: string
  body: string
  problemIds?: ProblemId[]
  parentIds?: KnowledgeAtomId[]
  tags?: string[]
}
