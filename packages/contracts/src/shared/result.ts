export type Result<T, E = AdapterError> =
  | { ok: true;  value: T }
  | { ok: false; error: E }

export const ok  = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result
}

export async function mapResultAsync<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<U>
): Promise<Result<U, E>> {
  return result.ok ? ok(await fn(result.value)) : result
}

export interface AdapterError {
  code: string
  message: string
  retryable: boolean
  cause?: unknown
}

export const adapterError = (
  code: string,
  message: string,
  opts?: { retryable?: boolean; cause?: unknown }
): AdapterError => ({
  code,
  message,
  retryable: opts?.retryable ?? false,
  cause: opts?.cause,
})
