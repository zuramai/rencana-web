import { and, asc, eq, inArray } from 'drizzle-orm'
import type { TicketDto } from '#shared/types/dto'
import { files, ticketFiles, tickets } from '../db/schema'

/** Tickets of a plan in creation order, each with its files in position order. */
export async function loadTickets(planId: string, ticketId?: string): Promise<TicketDto[]> {
  const rows = await db.select().from(tickets)
    .where(ticketId ? and(eq(tickets.planId, planId), eq(tickets.id, ticketId)) : eq(tickets.planId, planId))
    .orderBy(asc(tickets.createdAt))
  if (rows.length === 0) return []
  const fileRows = await db.select({
    ticketId: ticketFiles.ticketId, id: files.id, contentType: files.contentType, originalName: files.originalName
  }).from(ticketFiles).innerJoin(files, eq(files.id, ticketFiles.fileId))
    .where(inArray(ticketFiles.ticketId, rows.map(r => r.id))).orderBy(asc(ticketFiles.position))
  return rows.map(t => ({
    id: t.id,
    kind: t.kind,
    title: t.title,
    description: t.description,
    locationText: t.locationText,
    locationUrl: t.locationUrl,
    files: fileRows.filter(f => f.ticketId === t.id).map(({ id, contentType, originalName }) => ({ id, contentType, originalName }))
  }))
}

export async function findTicket(planId: string, ticketId: string | undefined): Promise<TicketDto> {
  const [ticket] = ticketId && isUuid(ticketId) ? await loadTickets(planId, ticketId) : []
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'ticket_not_found' })
  return ticket
}
