import { describe, expect, it } from 'vitest'
import { computeBudgetSummary, tripDays, type BudgetInput } from '#shared/utils/budget'

const base: BudgetInput = {
  budgetCurrency: 'IDR',
  budgetAmount: 10_000_000,
  items: [
    { type: 'accommodation', currency: 'JPY', price: 20_000, startsAt: '2027-03-03T15:00', endsAt: '2027-03-05T11:00' },
    { type: 'food_beverage', currency: 'IDR', price: 150_000, startsAt: '2027-03-04T19:00', endsAt: null }
  ],
  costs: [
    { id: 'meals', name: 'Meals', frequency: 'daily', currency: 'IDR', amount: 300_000, days: null },
    { id: 'esim', name: 'eSIM', frequency: 'one_time', currency: 'IDR', amount: 200_000, days: null }
  ],
  rates: { JPY: 114.5 }
}

describe('computeBudgetSummary', () => {
  it('converts foreign prices and multiplies daily costs by trip length', () => {
    const s = computeBudgetSummary(base)
    expect(s.tripDays).toBe(3)
    expect(s.itineraryTotal).toBe(2_440_000)
    expect(s.byType).toEqual({ accommodation: 2_290_000, food_beverage: 150_000 })
    expect(s.otherCostsTotal).toBe(1_100_000)
    expect(s.grandTotal).toBe(3_540_000)
    expect(s.remaining).toBe(6_460_000)
    expect(s.missingRates).toEqual([])
  })

  it('excludes amounts without a rate and reports the currency', () => {
    const s = computeBudgetSummary({
      ...base,
      items: [...base.items, { type: 'attraction', currency: 'VND', price: 500_000, startsAt: '2027-03-04T10:00', endsAt: null }]
    })
    expect(s.itineraryTotal).toBe(2_440_000)
    expect(s.grandTotal).toBe(3_540_000)
    expect(s.byType.attraction).toBeUndefined()
    expect(s.missingRates).toEqual(['VND'])
  })

  it('uses explicit days for a daily cost', () => {
    const s = computeBudgetSummary({
      ...base,
      costs: [{ id: 'x', name: 'Taxi', frequency: 'daily', currency: 'IDR', amount: 100_000, days: 2 }]
    })
    expect(s.costs[0]).toMatchObject({ days: 2, total: 200_000, converted: 200_000 })
  })

  it('marks costs in an unknown currency as unconverted', () => {
    const s = computeBudgetSummary({
      ...base,
      costs: [{ id: 'x', name: 'Visa', frequency: 'one_time', currency: 'USD', amount: 35, days: null }]
    })
    expect(s.costs[0]!.converted).toBeNull()
    expect(s.otherCostsTotal).toBe(0)
    expect(s.missingRates).toEqual(['USD'])
  })

  it('has no remaining amount without a budget', () => {
    expect(computeBudgetSummary({ ...base, budgetAmount: null }).remaining).toBeNull()
  })
})

describe('tripDays', () => {
  it('is 1 without items', () => {
    expect(tripDays([])).toBe(1)
  })

  it('counts across a month boundary', () => {
    expect(tripDays([{ type: 'other', currency: null, price: null, startsAt: '2027-02-27T10:00', endsAt: '2027-03-02T09:00' }])).toBe(4)
  })
})
