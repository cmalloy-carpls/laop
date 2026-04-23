import type { Result } from '../shared/result.js'

export interface DocGenAdapter {
  /** Render a template with provided data, returns a document buffer */
  render(params: RenderParams): Promise<Result<RenderResult>>
  /** List available templates */
  listTemplates(): Promise<Result<DocumentTemplate[]>>
  /** Get merge-field schema for a specific template */
  getTemplateFields(templateId: string): Promise<Result<TemplateField[]>>
}

export interface RenderParams {
  templateId: string
  data: Record<string, unknown>
  outputFormat: 'pdf' | 'docx'
}

export interface RenderResult {
  content: Buffer
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  filename: string
  pageCounts: number
}

export interface DocumentTemplate {
  id: string
  name: string
  description: string | null
  outputFormats: Array<'pdf' | 'docx'>
  tags: string[]
}

export interface TemplateField {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'list'
  required: boolean
}
