import { asc, eq } from 'drizzle-orm'
import { itineraryItems } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const rows = await db.select().from(itineraryItems).where(eq(itineraryItems.planId, plan.id))
    .orderBy(asc(itineraryItems.startsAt), asc(itineraryItems.createdAt))
  return rows.map(itemDto)
})
