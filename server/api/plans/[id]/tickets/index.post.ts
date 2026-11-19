import { ticketInput } from '#shared/schemas/ticket'
import { ticketFiles, tickets } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const { data, files } = await readMultipart(event, ticketInput)
  const parts = files('files')
  if (parts.length === 0) throw createError({ statusCode: 400, statusMessage: 'files_required' })

  const saved = await saveUploads(plan.userId, parts, { allowPdf: true })
  const ticketId = await db.transaction(async (tx) => {
    const [row] = await tx.insert(tickets).values({
      planId: plan.id,
      kind: data.kind,
      title: data.title,
      description: data.description,
      locationText: data.locationText,
      locationUrl: data.locationUrl
    }).returning({ id: tickets.id })
    await tx.insert(ticketFiles).values(saved.map((f, position) => ({ ticketId: row!.id, fileId: f.id, position })))
    return row!.id
  })
  await touchPlan(plan.id)
  return findTicket(plan.id, ticketId)
})
