import { eq, sql } from 'drizzle-orm'
import { ticketInput } from '#shared/schemas/ticket'
import { ticketFiles, tickets } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const ticket = await findTicket(plan.id, getRouterParam(event, 'ticketId'))
  const { data, files } = await readMultipart(event, ticketInput)
  const parts = files('files')

  const removeIds = ticket.files.map(f => f.id).filter(id => data.removeFileIds?.includes(id))
  if (ticket.files.length - removeIds.length + parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'files_required' })
  }

  const saved = await saveUploads(plan.userId, parts, { allowPdf: true })
  await db.transaction(async (tx) => {
    await tx.update(tickets).set({
      kind: data.kind,
      title: data.title,
      description: data.description,
      locationText: data.locationText,
      locationUrl: data.locationUrl,
      updatedAt: sql`now()`
    }).where(eq(tickets.id, ticket.id))
    if (saved.length > 0) {
      const [last] = await tx.select({ max: sql<number>`coalesce(max(${ticketFiles.position}), -1)::int` })
        .from(ticketFiles).where(eq(ticketFiles.ticketId, ticket.id))
      const start = (last?.max ?? -1) + 1
      await tx.insert(ticketFiles).values(saved.map((f, i) => ({ ticketId: ticket.id, fileId: f.id, position: start + i })))
    }
  })
  // Deleting the file rows cascades their ticket_files links.
  await deleteFileRows(removeIds)
  await touchPlan(plan.id)
  return findTicket(plan.id, ticket.id)
})
