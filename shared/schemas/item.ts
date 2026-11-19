import { z } from 'zod'
import { ITEM_TYPE_VALUES } from '../utils/item-types'
import { currencyCode, decimalString, optionalText, optionalUrl, wallClock } from './common'

export const itemInput = z.object({
  type: z.enum(ITEM_TYPE_VALUES),
  description: z.string().trim().min(1).max(200),
  allDay: z.boolean(),
  startsAt: wallClock,
  endsAt: wallClock.nullable(),
  currency: currencyCode.nullable(),
  price: decimalString.nullable(),
  note: optionalText(2000),
  link: optionalUrl,
  removeImage: z.boolean().optional()
}).superRefine((p, ctx) => {
  // Fixed-width YYYY-MM-DDTHH:mm strings compare chronologically.
  if (p.endsAt != null && p.endsAt < p.startsAt) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'end_before_start' })
  if ((p.currency == null) !== (p.price == null)) ctx.addIssue({ code: 'custom', path: ['price'], message: 'price_currency_pair' })
})

export type ItemInput = z.infer<typeof itemInput>
