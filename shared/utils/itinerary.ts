export interface DayGroup<T> {
  /** `YYYY-MM-DD` */
  date: string
  /** 1-based day number counted from the first item's date */
  dayNumber: number
  items: T[]
}

/** Group items (already sorted by `startsAt`) by the date part of `startsAt`. */
export function groupByDay<T extends { startsAt: string }>(items: T[]): DayGroup<T>[] {
  const groups: DayGroup<T>[] = []
  const first = items[0] ? dateToUtc(items[0].startsAt) : 0
  for (const item of items) {
    const date = item.startsAt.slice(0, 10)
    let group = groups.at(-1)
    if (group?.date !== date) {
      group = { date, dayNumber: Math.round((dateToUtc(date) - first) / 86_400_000) + 1, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

/** UTC epoch ms of the date part of a `YYYY-MM-DD[THH:mm]` wall-clock string. */
export function dateToUtc(value: string): number {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return Date.UTC(y!, m! - 1, d!)
}

/** "Wed, 3 Mar" style label for a `YYYY-MM-DD` date, independent of the viewer's time zone. */
export function formatDayLabel(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(dateToUtc(date)))
}
