import { asc, eq } from 'drizzle-orm'
import type { CostDto } from '#shared/types/dto'
import { expectedCosts } from '../../../../db/schema'

export default defineEventHandler(async (event): Promise<CostDto[]> => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  return db.select({
    id: expectedCosts.id,
    name: expectedCosts.name,
    frequency: expectedCosts.frequency,
    currency: expectedCosts.currency,
    amount: expectedCosts.amount,
    days: expectedCosts.days
  }).from(expectedCosts).where(eq(expectedCosts.planId, plan.id)).orderBy(asc(expectedCosts.createdAt))
})
