import { and, eq } from 'drizzle-orm'
import { expectedCosts } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const costId = getRouterParam(event, 'costId')
  const [row] = costId && isUuid(costId)
    ? await db.delete(expectedCosts)
        .where(and(eq(expectedCosts.id, costId), eq(expectedCosts.planId, plan.id))).returning({ id: expectedCosts.id })
    : []
  if (!row) throw createError({ statusCode: 404, statusMessage: 'cost_not_found' })
  await touchPlan(plan.id)
  return { ok: true }
})
