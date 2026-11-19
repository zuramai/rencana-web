import { z } from 'zod'
import { COVER_COLORS } from '../utils/item-types'
import { currencyCode, decimalString } from './common'

const year = z.number().int().min(1900).max(2200)
const month = z.number().int().min(1).max(12)

export const planInput = z.object({
  name: z.string().trim().min(1).max(80),
  coverType: z.enum(['emoji', 'image']),
  coverEmoji: z.string().regex(/^fluent-emoji-flat:[a-z0-9-]+$/).nullish().transform(v => v ?? null),
  coverColor: z.enum(COVER_COLORS),
  /** Edit only: drop the current cover image without uploading a new one. */
  removeCoverImage: z.boolean().optional(),
  startYear: year.nullable(),
  startMonth: month.nullable(),
  endYear: year.nullable(),
  endMonth: month.nullable(),
  budgetCurrency: currencyCode,
  budgetAmount: decimalString.nullable()
}).superRefine((p, ctx) => {
  if (p.coverType === 'emoji' && !p.coverEmoji) ctx.addIssue({ code: 'custom', path: ['coverEmoji'], message: 'required' })
  if (p.startMonth != null && p.startYear == null) ctx.addIssue({ code: 'custom', path: ['startYear'], message: 'required' })
  if (p.endYear != null && p.startYear == null) ctx.addIssue({ code: 'custom', path: ['startYear'], message: 'required' })
  if (p.endMonth != null && p.endYear == null) ctx.addIssue({ code: 'custom', path: ['endYear'], message: 'required' })
  if (p.startYear != null && p.endYear != null) {
    const start = p.startYear * 12 + (p.startMonth ?? 1)
    const end = p.endYear * 12 + (p.endMonth ?? 12)
    if (end < start) ctx.addIssue({ code: 'custom', path: ['endYear'], message: 'end_before_start' })
  }
})

export type PlanInput = z.infer<typeof planInput>
