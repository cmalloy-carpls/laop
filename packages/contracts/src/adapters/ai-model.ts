import type { Result } from '../shared/result.js'

export interface AIModelAdapter {
  complete(params: CompletionParams): Promise<Result<CompletionResult>>
  streamComplete(params: CompletionParams): AsyncIterable<CompletionChunk>
  embed(params: EmbeddingParams): Promise<Result<EmbeddingResult>>
}

export interface CompletionParams {
  /** Defaults to adapter's configured model */
  model?: string
  systemPrompt: string
  messages: CompletionMessage[]
  maxTokens?: number
  temperature?: number
  tools?: AITool[]
}

export interface CompletionMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CompletionResult {
  content: string
  stopReason: 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence'
  usage: TokenUsage
  toolCalls: AIToolCall[]
}

export interface CompletionChunk {
  delta: string
  done: boolean
}

export interface EmbeddingParams {
  model?: string
  input: string | string[]
  dimensions?: number
}

export interface EmbeddingResult {
  embeddings: number[][]
  usage: TokenUsage
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

export interface AITool {
  name: string
  description: string
  /** JSON Schema */
  inputSchema: Record<string, unknown>
}

export interface AIToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}
