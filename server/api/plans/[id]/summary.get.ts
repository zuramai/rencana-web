import type { SummaryDto } from '#shared/types/dto'

export default defineEventHandler(async (event): Promise<SummaryDto> => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const { summary, rates } = await loadPlanBudget(plan)
  return { ...summary, rates }
})
