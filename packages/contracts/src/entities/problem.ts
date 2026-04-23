import type { ProblemId } from '../shared/branded.js'

export interface Problem {
  id: ProblemId
  /** LSC case service report code (e.g., "32" = Housing) */
  lscCode: string | null
  /** LSC sub-code (e.g., "3243" = Eviction) */
  lscSubcode: string | null
  label: string
  description: string | null
  parentId: ProblemId | null
  isLeaf: boolean
  isActive: boolean
  /** Sort order within sibling group */
  sortOrder: number
}

export interface ProblemTree extends Problem {
  children: ProblemTree[]
}
