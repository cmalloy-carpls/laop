import type { EmailAddress, ISODateTimeString } from '../shared/branded.js'
import type { Result } from '../shared/result.js'

export interface CalendarAdapter {
  /** Return available time slots for a given duration and lookahead window */
  getAvailability(params: AvailabilityParams): Promise<Result<TimeSlot[]>>
  createBooking(params: CreateBookingParams): Promise<Result<Booking>>
  cancelBooking(bookingId: string, reason?: string): Promise<Result<void>>
  getBooking(bookingId: string): Promise<Result<Booking>>
  /** Called by inbound webhook on booking events */
  handleWebhook(payload: Record<string, unknown>): Promise<Result<BookingWebhookEvent>>
}

export interface AvailabilityParams {
  eventTypeId: string
  durationMinutes: number
  fromDate: ISODateTimeString
  toDate: ISODateTimeString
  timezone: string
}

export interface TimeSlot {
  startAt: ISODateTimeString
  endAt: ISODateTimeString
  available: boolean
}

export interface CreateBookingParams {
  eventTypeId: string
  startAt: ISODateTimeString
  attendee: { email: EmailAddress; name: string }
  metadata?: Record<string, string>
}

export interface Booking {
  id: string
  eventTypeId: string
  startAt: ISODateTimeString
  endAt: ISODateTimeString
  attendeeEmail: EmailAddress
  attendeeName: string
  status: 'confirmed' | 'cancelled' | 'rescheduled'
  cancelledAt: ISODateTimeString | null
  metadata: Record<string, string>
}

export interface BookingWebhookEvent {
  type: 'booking.created' | 'booking.cancelled' | 'booking.rescheduled'
  booking: Booking
}
