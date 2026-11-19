import { eq } from 'drizzle-orm'
import { tickets } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const ticket = await findTicket(plan.id, getRouterParam(event, 'ticketId'))
  await db.delete(tickets).where(eq(tickets.id, ticket.id))
  await deleteFileRows(ticket.files.map(f => f.id))
  await touchPlan(plan.id)
  return { ok: true }
})
