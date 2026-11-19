import type { ItemDto } from '#shared/types/dto'
import type { ItemRow } from '../db/schema'

/** `2027-03-03 15:00:00` (postgres) → `2027-03-03T15:00`. */
export function wallClockOut(value: string): string {
  return value.slice(0, 16).replace(' ', 'T')
}

export function itemDto(row: ItemRow): ItemDto {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    allDay: row.allDay,
    startsAt: wallClockOut(row.startsAt),
    endsAt: row.endsAt ? wallClockOut(row.endsAt) : null,
    currency: row.currency,
    price: row.price,
    note: row.note,
    link: row.link,
    imageFileId: row.imageFileId
  }
}
