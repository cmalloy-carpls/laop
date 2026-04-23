import type { Result } from '../shared/result.js'

export interface StorageAdapter {
  upload(params: UploadParams): Promise<Result<UploadResult>>
  getSignedUrl(key: string, expiresInSeconds: number): Promise<Result<string>>
  delete(key: string): Promise<Result<void>>
  exists(key: string): Promise<Result<boolean>>
  /** Move/rename without re-uploading */
  copy(sourceKey: string, destKey: string): Promise<Result<void>>
}

export interface UploadParams {
  key: string
  body: Buffer | ReadableStream
  contentType: string
  contentLength?: number
  metadata?: Record<string, string>
}

export interface UploadResult {
  key: string
  sizeBytes: number
  etag: string | null
}
