const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export default defineEventHandler(async (event) => {
  const plan = await requirePlan(event, getRouterParam(event, 'id'))
  const kind = getRouterParam(event, 'kind')
  const ctx = await exportContext(event, plan)
  const slug = slugify(plan.name)

  let body: Buffer
  let contentType = 'application/pdf'
  let filename: string
  if (kind === 'itinerary-pdf') {
    body = await buildItineraryPdf(ctx, await loadPlanBudget(plan))
    filename = `${slug}-itinerary.pdf`
  } else if (kind === 'itinerary-xlsx') {
    body = await buildItineraryXlsx(ctx, await loadPlanBudget(plan))
    contentType = XLSX
    filename = `${slug}-itinerary.xlsx`
  } else if (kind === 'tickets-pdf') {
    const tickets = await loadTickets(plan.id)
    if (tickets.length === 0) throw createError({ statusCode: 404, statusMessage: 'no_tickets' })
    body = await buildTicketsPdf(ctx, tickets)
    filename = `${slug}-tickets.pdf`
  } else {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'Cache-Control', 'no-store')
  return body
})
