import { eq } from 'drizzle-orm'
import { itineraryItems } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const item = await findItem(plan.id, getRouterParam(event, 'itemId'))
  await db.delete(itineraryItems).where(eq(itineraryItems.id, item.id))
  await deleteFileRows([item.imageFileId])
  await touchPlan(plan.id)
  return { ok: true }
})
