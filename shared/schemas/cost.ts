import { z } from 'zod'
import { currencyCode, decimalString } from './common'

export const costInput = z.object({
  name: z.string().trim().min(1).max(80),
  frequency: z.enum(['one_time', 'daily']),
  currency: currencyCode,
  amount: decimalString.refine(v => Number(v) > 0, 'must_be_positive'),
  days: z.number().int().min(1).max(365).nullable()
}).transform(c => ({ ...c, days: c.frequency === 'one_time' ? null : c.days }))

export type CostInput = z.infer<typeof costInput>

export const rateInput = z.object({
  rate: z.number().positive().nullable()
})
