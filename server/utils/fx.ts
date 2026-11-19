import { asc, eq, sql } from 'drizzle-orm'
import type { CostDto, FxRateDto, ItemDto } from '#shared/types/dto'
import { computeBudgetSummary, type BudgetSummary } from '#shared/utils/budget'
import { expectedCosts, itineraryItems, planFxRates, type FxRateRow, type PlanRow } from '../db/schema'

const STALE_MS = 24 * 60 * 60 * 1000

interface FrankfurterResponse {
  base: string
  date: string
  rates: Record<string, number>
}

/**
 * Rates into the plan's budget currency for `currencies`. Missing or stale
 * (> 24 h) auto rates are refreshed from Frankfurter; manual rows are never
 * overwritten. Fetch failures leave existing rows as they are, so currencies
 * without any row surface as missing rates.
 */
export async function ensureRates(plan: PlanRow, currencies: string[]): Promise<FxRateRow[]> {
  const rows = await db.select().from(planFxRates).where(eq(planFxRates.planId, plan.id))
  const byCurrency = new Map(rows.map(r => [r.currency, r]))
  const wanted = [...new Set(currencies)].filter(c => c !== plan.budgetCurrency)
  const toFetch = wanted.filter((c) => {
    const row = byCurrency.get(c)
    return !row || (row.source === 'auto' && Date.now() - row.fetchedAt.getTime() > STALE_MS)
  })

  if (toFetch.length > 0) {
    try {
      const res = await $fetch<FrankfurterResponse>('https://api.frankfurter.dev/v1/latest', {
        query: { base: plan.budgetCurrency, symbols: toFetch.join(',') },
        timeout: 5000
      })
      const fetchedAt = new Date()
      const values = toFetch
        .filter(c => typeof res.rates[c] === 'number' && res.rates[c] > 0)
        .map(c => ({ planId: plan.id, currency: c, rate: String(1 / res.rates[c]!), source: 'auto', fetchedAt }))
      if (values.length > 0) {
        const saved = await db.insert(planFxRates).values(values).onConflictDoUpdate({
          target: [planFxRates.planId, planFxRates.currency],
          set: { rate: sql`excluded.rate`, source: sql`excluded.source`, fetchedAt: sql`excluded.fetched_at` },
          setWhere: sql`${planFxRates.source} = 'auto'`
        }).returning()
        for (const row of saved) byCurrency.set(row.currency, row)
      }
    } catch (error) {
      console.warn('[fx] Frankfurter fetch failed:', error instanceof Error ? error.message : error)
    }
  }
  return wanted.flatMap(c => byCurrency.get(c) ?? []).sort((a, b) => a.currency.localeCompare(b.currency))
}

export interface PlanBudget {
  items: ItemDto[]
  costs: CostDto[]
  summary: BudgetSummary
  rates: FxRateDto[]
}

/** Items, costs, rates and the computed summary of a plan (summary API and exports). */
export async function loadPlanBudget(plan: PlanRow): Promise<PlanBudget> {
  const [itemRows, costRows] = await Promise.all([
    db.select().from(itineraryItems).where(eq(itineraryItems.planId, plan.id))
      .orderBy(asc(itineraryItems.startsAt), asc(itineraryItems.createdAt)),
    db.select().from(expectedCosts).where(eq(expectedCosts.planId, plan.id)).orderBy(asc(expectedCosts.createdAt))
  ])
  const items = itemRows.map(itemDto)
  const costs: CostDto[] = costRows.map(c => ({
    id: c.id, name: c.name, frequency: c.frequency, currency: c.currency, amount: c.amount, days: c.days
  }))
  const rateRows = await ensureRates(plan, [
    ...items.flatMap(i => (i.currency ? [i.currency] : [])),
    ...costs.map(c => c.currency)
  ])
  const rates: FxRateDto[] = rateRows.map(r => ({
    currency: r.currency,
    rate: Number(r.rate),
    source: r.source === 'manual' ? 'manual' : 'auto',
    fetchedAt: r.fetchedAt.toISOString()
  }))
  const summary = computeBudgetSummary({
    budgetCurrency: plan.budgetCurrency,
    budgetAmount: plan.budgetAmount == null ? null : Number(plan.budgetAmount),
    items: items.map(i => ({
      type: i.type, currency: i.currency, price: i.price == null ? null : Number(i.price), startsAt: i.startsAt, endsAt: i.endsAt
    })),
    costs: costs.map(c => ({ ...c, amount: Number(c.amount) })),
    rates: Object.fromEntries(rates.map(r => [r.currency, r.rate]))
  })
  return { items, costs, summary, rates }
}
