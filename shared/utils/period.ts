export interface Period {
  startYear: number | null
  startMonth: number | null
  endYear: number | null
  endMonth: number | null
}

/**
 * Human period label: "Mar 2027", "2027", "Mar – Apr 2027", "Dec 2026 – Jan 2027", "2026 – 2027" …
 * Returns null when the plan has no start year.
 */
export function formatPeriod(p: Period, locale: string): string | null {
  if (p.startYear == null) return null
  const monthName = (m: number) => new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, m - 1, 1)))
  const single = (year: number, month: number | null) => month == null ? String(year) : `${monthName(month)} ${year}`

  const start = single(p.startYear, p.startMonth)
  if (p.endYear == null) return start
  if (p.endYear === p.startYear && p.endMonth === p.startMonth) return start

  if (p.endYear === p.startYear && p.startMonth != null && p.endMonth != null) {
    return `${monthName(p.startMonth)} – ${monthName(p.endMonth)} ${p.endYear}`
  }
  return `${start} – ${single(p.endYear, p.endMonth)}`
}
