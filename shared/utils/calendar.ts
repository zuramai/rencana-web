/** Fields of an itinerary item needed to put it in a calendar. */
export interface CalendarItem {
  description: string
  allDay: boolean
  /** `YYYY-MM-DDTHH:mm`, destination wall clock */
  startsAt: string
  endsAt: string | null
  note: string | null
  link: string | null
}

/** Calendar span: all-day uses dates with an exclusive end; timed uses wall clocks (1 hour when no end). */
export type CalendarSpan
  = | { allDay: true, start: string, end: string }
    | { allDay: false, start: string, end: string }

export const DEFAULT_EVENT_MINUTES = 60

const pad = (n: number) => String(n).padStart(2, '0')

function fields(wallClock: string): [number, number, number, number, number] {
  const [y, m, d] = wallClock.slice(0, 10).split('-').map(Number)
  const [h, mi] = wallClock.length > 10 ? wallClock.slice(11, 16).split(':').map(Number) : [0, 0]
  return [y!, m!, d!, h!, mi!]
}

/** `YYYY-MM-DD` shifted by whole days (calendar arithmetic, no time zone). */
export function addDays(date: string, days: number): string {
  const [y, m, d] = fields(date)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** `YYYY-MM-DDTHH:mm` shifted by minutes (wall-clock arithmetic, no time zone). */
export function addMinutes(wallClock: string, minutes: number): string {
  const [y, m, d, h, mi] = fields(wallClock)
  const t = new Date(Date.UTC(y, m - 1, d, h, mi + minutes))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`
}

export function calendarSpan(item: Pick<CalendarItem, 'allDay' | 'startsAt' | 'endsAt'>): CalendarSpan {
  if (item.allDay) {
    const start = item.startsAt.slice(0, 10)
    const last = (item.endsAt ?? item.startsAt).slice(0, 10)
    return { allDay: true, start, end: addDays(last < start ? start : last, 1) }
  }
  return { allDay: false, start: item.startsAt, end: item.endsAt ?? addMinutes(item.startsAt, DEFAULT_EVENT_MINUTES) }
}

/** `2027-03-03` → `20270303`; `2027-03-03T15:00` → `20270303T150000`. */
export function compactDateTime(value: string): string {
  const date = value.slice(0, 10).replaceAll('-', '')
  return value.length > 10 ? `${date}T${value.slice(11, 13)}${value.slice(14, 16)}00` : date
}

/** Plain-text event details: the note, then the link. */
export function calendarDetails(item: Pick<CalendarItem, 'note' | 'link'>): string {
  return [item.note, item.link].filter(Boolean).join('\n\n')
}

/**
 * Google Calendar "create event" link, prefilled with the item. Times are the destination wall clock;
 * with [timeZone] Google places them in that zone, otherwise in the user's calendar zone.
 */
export function googleCalendarUrl(item: CalendarItem, timeZone: string | null): string {
  const span = calendarSpan(item)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.description,
    dates: `${compactDateTime(span.start)}/${compactDateTime(span.end)}`
  })
  const details = calendarDetails(item)
  if (details) params.set('details', details)
  if (timeZone && !span.allDay) params.set('ctz', timeZone)
  return `https://calendar.google.com/calendar/render?${params}`
}
