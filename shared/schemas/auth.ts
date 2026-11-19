import { z } from 'zod'
import { currencyCode, localeCode } from './common'

const username = z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,32}$/, 'invalid_username')

export const registerInput = z.object({
  username,
  displayName: z.string().trim().min(1).max(60),
  password: z.string().min(8).max(128),
  timezone: z.string().max(64).optional(),
  locale: localeCode
})

export const loginInput = z.object({
  username: z.string().trim().toLowerCase().min(1).max(32),
  password: z.string().min(1).max(128)
})

export const meInput = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  locale: localeCode.optional(),
  defaultCurrency: currencyCode.optional()
})
