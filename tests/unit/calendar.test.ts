import { describe, expect, it } from 'vitest'
import { googleCalendarUrl, type CalendarItem } from '#shared/utils/calendar'

const base: CalendarItem = { description: 'Ramen dinner', allDay: false, startsAt: '2027-03-03T19:00', endsAt: null, note: null, link: null }
const query = (url: string) => new URL(url).searchParams

describe('googleCalendarUrl', () => {
  it('defaults timed events to one hour in the destination zone', () => {
    const q = query(googleCalendarUrl(base, 'Asia/Tokyo'))
    expect(q.get('action')).toBe('TEMPLATE')
    expect(q.get('text')).toBe('Ramen dinner')
    expect(q.get('dates')).toBe('20270303T190000/20270303T200000')
    expect(q.get('ctz')).toBe('Asia/Tokyo')
    expect(q.has('details')).toBe(false)
  })

  it('rolls a default end over midnight', () => {
    expect(query(googleCalendarUrl({ ...base, startsAt: '2027-12-31T23:30' }, null)).get('dates'))
      .toBe('20271231T233000/20280101T003000')
  })

  it('uses dates with an exclusive end for all-day items and omits ctz', () => {
    const q = query(googleCalendarUrl({ ...base, allDay: true, startsAt: '2027-03-03T00:00', endsAt: '2027-03-05T00:00' }, 'Asia/Tokyo'))
    expect(q.get('dates')).toBe('20270303/20270306')
    expect(q.has('ctz')).toBe(false)
  })

  it('puts the note and link in the details', () => {
    const q = query(googleCalendarUrl({ ...base, endsAt: '2027-03-03T21:15', note: 'Book ahead', link: 'https://ichiran.com' }, null))
    expect(q.get('dates')).toBe('20270303T190000/20270303T211500')
    expect(q.get('details')).toBe('Book ahead\n\nhttps://ichiran.com')
    expect(q.has('ctz')).toBe(false)
  })
})
