import { describe, expect, it } from 'vitest'
import { formatPeriod } from '#shared/utils/period'

const p = (startYear: number | null, startMonth: number | null, endYear: number | null, endMonth: number | null) =>
  formatPeriod({ startYear, startMonth, endYear, endMonth }, 'en')

describe('formatPeriod', () => {
  it.each([
    [[2027, 3, null, null], 'Mar 2027'],
    [[2027, null, null, null], '2027'],
    [[2027, 3, 2027, 4], 'Mar – Apr 2027'],
    [[2026, 12, 2027, 1], 'Dec 2026 – Jan 2027'],
    [[2026, null, 2027, null], '2026 – 2027'],
    [[2026, 3, 2027, null], 'Mar 2026 – 2027'],
    [[2026, null, 2027, 1], '2026 – Jan 2027'],
    [[2027, 3, 2027, 3], 'Mar 2027'],
    [[2027, null, 2027, null], '2027']
  ] as const)('%j → %s', (args, expected) => {
    expect(p(...args)).toBe(expected)
  })

  it('is null without a start', () => {
    expect(p(null, null, null, null)).toBeNull()
  })

  it('localizes month names', () => {
    expect(formatPeriod({ startYear: 2027, startMonth: 5, endYear: null, endMonth: null }, 'id')).toBe('Mei 2027')
  })
})
