import { z } from 'zod'

export const currencyCode = z.string().regex(/^[A-Z]{3}$/, 'invalid_currency')

export const decimalString = z.string().trim().regex(/^\d{1,14}(\.\d{1,2})?$/, 'invalid_amount')

export const wallClock = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'invalid_datetime')

export const httpUrl = z.string().trim().max(2000).regex(/^https?:\/\/\S+$/i, 'invalid_url')

/** Optional free text: trimmed, empty becomes null. */
export const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform(v => (v ? v : null))

export const optionalUrl = httpUrl.or(z.literal('')).nullish().transform(v => (v ? v : null))

export const localeCode = z.enum(['en', 'id'])
