import { costInput } from '#shared/schemas/cost'
import { expectedCosts } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, costInput.parse)
  const [row] = await db.insert(expectedCosts).values({ planId: plan.id, ...body }).returning({ id: expectedCosts.id })
  await touchPlan(plan.id)
  return { id: row!.id }
})
