import { eq } from 'drizzle-orm'
import { itineraryItems, plans, ticketFiles, tickets } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const fileIds = await db.transaction(async (tx) => {
    const itemImages = await tx.select({ id: itineraryItems.imageFileId }).from(itineraryItems).where(eq(itineraryItems.planId, plan.id))
    const ticketFileIds = await tx.select({ id: ticketFiles.fileId }).from(ticketFiles)
      .innerJoin(tickets, eq(tickets.id, ticketFiles.ticketId)).where(eq(tickets.planId, plan.id))
    await tx.delete(plans).where(eq(plans.id, plan.id))
    return [plan.coverFileId, ...itemImages.map(r => r.id), ...ticketFileIds.map(r => r.id)]
  })
  await deleteFileRows(fileIds)
  return { ok: true }
})
