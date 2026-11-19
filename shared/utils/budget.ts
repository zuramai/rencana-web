import type { CostFrequency, ItemType } from './item-types'
import { dateToUtc } from './itinerary'

export interface BudgetInput {
  budgetCurrency: string
  budgetAmount: number | null
  items: { type: ItemType, currency: string | null, price: number | null, startsAt: string, endsAt: string | null }[]
  costs: { id: string, name: string, frequency: CostFrequency, currency: string, amount: number, days: number | null }[]
  /** currency -> rate into budgetCurrency; budgetCurrency itself is implied 1 */
  rates: Record<string, number>
}

export interface BudgetCostLine {
  id: string
  days: number | null
  total: number
  currency: string
  converted: number | null
}

export interface BudgetSummary {
  currency: string
  tripDays: number
  itineraryTotal: number
  byType: Partial<Record<ItemType, number>>
  costs: BudgetCostLine[]
  otherCostsTotal: number
  grandTotal: number
  budgetAmount: number | null
  remaining: number | null
  /** sorted, unique */
  missingRates: string[]
}

const DAY_MS = 86_400_000
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Whole days covered by the itinerary (inclusive); 1 when there are no items. */
export function tripDays(items: BudgetInput['items']): number {
  if (items.length === 0) return 1
  let first = Infinity
  let last = -Infinity
  for (const item of items) {
    first = Math.min(first, dateToUtc(item.startsAt))
    last = Math.max(last, dateToUtc(item.endsAt ?? item.startsAt))
  }
  return Math.round((last - first) / DAY_MS) + 1
}

export function computeBudgetSummary(input: BudgetInput): BudgetSummary {
  const missing = new Set<string>()
  const convert = (amount: number, currency: string): number | null => {
    if (currency === input.budgetCurrency) return amount
    const rate = input.rates[currency]
    if (rate == null) {
      missing.add(currency)
      return null
    }
    return amount * rate
  }

  const days = tripDays(input.items)
  let itineraryTotal = 0
  const byType: Partial<Record<ItemType, number>> = {}
  for (const item of input.items) {
    if (item.price == null || item.currency == null) continue
    const converted = convert(item.price, item.currency)
    if (converted == null) continue
    itineraryTotal += converted
    byType[item.type] = (byType[item.type] ?? 0) + converted
  }
  for (const type of Object.keys(byType) as ItemType[]) byType[type] = round2(byType[type]!)

  let otherCostsTotal = 0
  const costs = input.costs.map((cost) => {
    const total = cost.frequency === 'daily' ? cost.amount * (cost.days ?? days) : cost.amount
    const converted = convert(total, cost.currency)
    if (converted != null) otherCostsTotal += converted
    return {
      id: cost.id,
      days: cost.frequency === 'daily' ? cost.days : null,
      total: round2(total),
      currency: cost.currency,
      converted: converted == null ? null : round2(converted)
    }
  })

  const grandTotal = round2(itineraryTotal + otherCostsTotal)
  return {
    currency: input.budgetCurrency,
    tripDays: days,
    itineraryTotal: round2(itineraryTotal),
    byType,
    costs,
    otherCostsTotal: round2(otherCostsTotal),
    grandTotal,
    budgetAmount: input.budgetAmount,
    remaining: input.budgetAmount == null ? null : round2(input.budgetAmount - grandTotal),
    missingRates: [...missing].sort()
  }
}
