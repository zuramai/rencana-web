export function formatMoney(amount: number, currency: string, locale: string, compact = false): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: compact ? 1 : undefined,
    notation: compact ? 'compact' : 'standard'
  }).format(amount)
}

export interface CurrencyOption {
  value: string
  label: string
}

export function currencyOptions(locale: string): CurrencyOption[] {
  const names = new Intl.DisplayNames(locale, { type: 'currency' })
  return Intl.supportedValuesOf('currency').map(code => ({ value: code, label: `${code} — ${names.of(code) ?? code}` }))
}

/**
 * Free-typed amount → decimal string for the API ("25.000.000" → "25000000",
 * "1.234,5" → "1234.5", "12,50" → "12.50"); null when empty. A lone separator
 * followed by exactly three digits is read as a thousands separator.
 */
export function normalizeAmount(input: string): string | null {
  const s = input.replace(/[\s\u00A0]/g, '')
  if (!s) return null
  const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','))
  if (lastSep === -1) return s
  const separatorKinds = new Set(s.match(/[.,]/g))
  if (s.length - lastSep - 1 === 3 && separatorKinds.size === 1) return s.replace(/[.,]/g, '')
  return `${s.slice(0, lastSep).replace(/[.,]/g, '')}.${s.slice(lastSep + 1)}`
}

/** Stored decimal ("25000000.00") → editable text ("25000000"). */
export function amountToInput(value: string | number | null | undefined): string {
  return value == null ? '' : String(Number(value))
}
