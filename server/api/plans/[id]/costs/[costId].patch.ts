import { and, eq } from 'drizzle-orm'
import { costInput } from '#shared/schemas/cost'
import { expectedCosts } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const costId = getRouterParam(event, 'costId')
  const body = await readValidatedBody(event, costInput.parse)
  const [row] = costId && isUuid(costId)
    ? await db.update(expectedCosts).set(body)
        .where(and(eq(expectedCosts.id, costId), eq(expectedCosts.planId, plan.id))).returning({ id: expectedCosts.id })
    : []
  if (!row) throw createError({ statusCode: 404, statusMessage: 'cost_not_found' })
  await touchPlan(plan.id)
  return { id: row.id }
})
