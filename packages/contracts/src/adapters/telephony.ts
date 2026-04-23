import type { E164PhoneNumber, CallId, RecordingId, ISODateTimeString } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface TelephonyAdapter {
  /** Called by webhook handler on inbound call */
  handleInboundCall(params: InboundCallParams): Promise<Result<InboundCallResult>>
  /** Caller-ID lookup before screen-pop */
  lookupCaller(phoneNumber: E164PhoneNumber): Promise<Result<CallerLookupResult>>
  startRecording(callId: CallId): Promise<Result<void>>
  stopRecording(callId: CallId): Promise<Result<RecordingResult>>
  /** Returns transcript once recording is processed */
  getTranscript(callId: CallId): Promise<Result<TranscriptResult>>
  hangup(callId: CallId): Promise<Result<void>>
}

export interface InboundCallParams {
  callId: CallId
  from: E164PhoneNumber
  to: E164PhoneNumber
  startedAt: ISODateTimeString
  /** Raw adapter payload — for audit */
  rawPayload: Record<string, unknown>
}

export interface InboundCallResult {
  callId: CallId
  /** TwiML or equivalent response to control call routing */
  instructions: unknown
}

export interface CallerLookupResult {
  phoneNumber: E164PhoneNumber
  /** Name from CNAM if available */
  name: string | null
  carrierType: 'mobile' | 'landline' | 'voip' | 'unknown'
}

export interface RecordingResult {
  recordingId: RecordingId
  callId: CallId
  durationSeconds: number
  storageKey: string | null
}

export interface TranscriptSegment {
  speaker: 'agent' | 'caller'
  text: string
  startMs: number
  endMs: number
}

export interface TranscriptResult {
  callId: CallId
  recordingId: RecordingId
  segments: TranscriptSegment[]
  fullText: string
}
