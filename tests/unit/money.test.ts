import { describe, expect, it } from 'vitest'
import { normalizeAmount } from '#shared/utils/money'

describe('normalizeAmount', () => {
  it.each([
    ['', null],
    ['  ', null],
    ['20000', '20000'],
    ['25.000.000', '25000000'],
    ['1,000', '1000'],
    ['12.5', '12.5'],
    ['12,50', '12.50'],
    ['1.234,56', '1234.56'],
    ['1,234.56', '1234.56'],
    ['300 000', '300000']
  ])('%j → %j', (input, expected) => {
    expect(normalizeAmount(input)).toBe(expected)
  })
})
